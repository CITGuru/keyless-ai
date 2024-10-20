import { NextRequest, NextResponse } from "next/server";
// Initialize Swarm with your API key
import {
    Swarm
} from "@pluralityai/agents";
import { symbol, z } from "zod";

import { SendTokenAgent, AssistantAgent } from "../../../agents";
import { loadIntent } from "../../../lib/intents"
import { ETHAddress, getTokenDetails } from "@/lib/utils";
import { constructBundleRequest, triggerBundleRoute } from "@/lib/enso";

const swarm = new Swarm(process.env.OPEN_API_KEY);

export async function GET() {

    const data = {}

    return Response.json({ data })
}


const Schema = z.object({
    query: z.string(),
    account: z.string(),
    chain: z.string()
});


const agents = ["prepareTransaction", "prepareSwapTransaction"]
const agentIntent: any = {
    "prepareTransaction": "send",
    "prepareSwapTransaction": "swap"
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const data = Schema.parse(body)
    const { query } = data
    const messages = [{ role: "user", content: query }];

    try {
        const response = await swarm.run({
            agent: SendTokenAgent,
            messages,
        }) as { messages: { content: string, role: string, tool_call_id?: string, tool_name?: string }[] }


        const actions = response.messages.filter((message) => message.tool_name && agents.includes(message.tool_name)).map((m) => ({ ...m, content: JSON.parse(m.content) }))


        const actionExpand = []
        const chain = data.chain


        for (const action of actions) {
            if (action.tool_name) {
                const intent = agentIntent[action.tool_name]

                let payload: { [x: string]: any } = {
                    type: intent,
                    tool: action.tool_name
                }


                if (action.tool_name == "prepareTransaction") {
                    const token = {
                        symbol: action.content.token,
                        address: getTokenDetails(action.content.token, Number(chain))?.address
                    }

                    const receiverAddress = new ETHAddress(action.content.receiver)
                    await receiverAddress.resolve()

                    const receiver = receiverAddress.hex || action.content.receiver
                    payload = {
                        ...payload,
                        amount: action.content.amount,
                        receiver: receiver,
                        token
                    }
                } else if (action.tool_name == "prepareSwapTransaction") {

                    const tokenIn = {
                        symbol: action.content.tokenIn,
                        address: getTokenDetails(action.content.tokenIn, Number(chain))?.address
                    }
                    const tokenOut = {
                        symbol: action.content.tokenOut,
                        address: getTokenDetails(action.content.tokenOut, Number(chain))?.address
                    }
                    payload = {
                        ...payload,
                        amount: action.content.amount,
                        tokenIn: tokenIn,
                        tokenOut: tokenOut,
                    }
                }
                const txIntent = loadIntent({ ...payload })

                const txData = await txIntent.buildTransaction({ chain_id: Number(data.chain) }, data.account)

                actionExpand.push({
                    ...action,
                    txData,
                    resolved: payload
                })

            }
        }

        const message = response.messages[response.messages.length - 1].content;

        return NextResponse.json({ actions: actionExpand, message: message });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "An error occurred while processing your request." },
            { status: 500 }
        );
    }

}
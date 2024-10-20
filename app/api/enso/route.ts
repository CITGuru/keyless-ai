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
import { TokensIcon } from "@radix-ui/react-icons";

const swarm = new Swarm(process.env.OPEN_API_KEY);

export async function GET() {

    const data = {}

    return Response.json({ data })
}

const TokenSchema = z.object({
    symbol: z.string(),
    address: z.string()
})

const Schema = z.object({
    account: z.string(),
    chain: z.string(),
    bundle: z.array(z.object({
        type: z.string(),
        tool: z.string(),
        amount: z.number(),
        receiver: z.string().optional(),
        token: TokenSchema.optional(),
        tokenOut: TokenSchema.optional(),
        tokenIn: TokenSchema.optional()
    }))
});


export async function POST(request: NextRequest) {
    const body = await request.json();
    const data = Schema.parse(body)
    const { chain, account, bundle } = data
    try {

        let bundleList: any = bundle.map((a) => ({ content: a, type: a.tool }))

        bundleList = await constructBundleRequest(bundleList);

        const bundleTx = await triggerBundleRoute({ chainId: Number(chain), fromAddress: data.account }, bundleList)


        return NextResponse.json({ ...bundleTx });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "An error occurred while processing your request." },
            { status: 500 }
        );
    }

}
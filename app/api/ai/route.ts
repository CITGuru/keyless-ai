import { NextRequest, NextResponse } from "next/server";
// Initialize Swarm with your API key
import {
    Swarm
} from "@pluralityai/agents";
import { z } from "zod";

import { SendTokenAgent } from "../../../agents/SendTokenAgent";

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


        const tools = response.messages.filter((message) => message.tool_name && agents.includes(message.tool_name)).map((m)=>({...m, content: JSON.parse(m.content)}))


        const message = response.messages[response.messages.length - 1].content;


        return NextResponse.json({ tools, message: message });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "An error occurred while processing your request." },
            { status: 500 }
        );
    }

}
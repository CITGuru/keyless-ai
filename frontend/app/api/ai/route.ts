import { NextRequest, NextResponse } from "next/server";
// Initialize Swarm with your API key
import { Swarm, Agent, AgentFunction } from "@pluralityai/agents";

import { SendTokenAgent } from "../../../agents/SendTokenAgent";

const swarm = new Swarm(process.env.OPEN_API_KEY);

export async function GET() {
   
    const data = {}
   
    return Response.json({ data })
}

export async function POST(request: NextRequest) {
    const { query } = await request.json();
    const messages = [{ role: "user", content: query }];
  
    try {
        const response = await swarm.run({
          agent: SendTokenAgent,
          messages,
        });
        // const result = response.messages[response.messages.length - 1].content;
        return NextResponse.json({ response });
      } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
          { error: "An error occurred while processing your request." },
          { status: 500 }
        );
      }

}
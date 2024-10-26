import { NextRequest, NextResponse } from "next/server";
// Initialize Swarm with your API key
import { z } from "zod";

import { constructBundleRequest, triggerBundleRoute } from "@/lib/enso";


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
    const { chain, bundle } = data
    try {

        // eslint-disable-next-line
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
import axios from "axios"
import { ENSO_API_KEY } from "./constants";
import { getTokenDetailsByContract } from "./utils";
import { parseUnits } from "viem";


const BASE_URL = "http://api.enso.finance/api/v1/"

export interface BundleItem {
    protocol: string;
    action: string;
    args: Record<string, string>;
}


export const EnsoAgent = axios.create({
    baseURL: BASE_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENSO_API_KEY}`
    },
});

export const constructTransferAction = (token: string, recipient: string, amount: string): BundleItem => {
    return {
        protocol: "enso",
        action: "transfer",
        args: {
            token,
            recipient,
            amount
        }
    };
};

export const constructSwapAction = (tokenIn: string, tokenOut: string, amount: string): BundleItem => {
    return {
        protocol: "enso",
        action: "route",
        args: {
            tokenIn,
            tokenOut,
            amountIn: amount
        }
    };
};


export const constructBundleRequest = async (actions: { type?: string, content: { [x: string]: any } }[]): Promise<BundleItem[]> => {
    const bundleList: BundleItem[] = []

    for (const action of actions) {
        console.log(action)
        switch (action.type) {
            case "prepareTransaction":
                const token = getTokenDetailsByContract(action.content.token.address)
                const tokenDecimal = token?.decimals || 18
                const tokenAmount = parseUnits(action.content.amount.toString(), tokenDecimal)
                const transfer = constructTransferAction(action.content.token.address, action.content.receiver, tokenAmount.toString())
                bundleList.push(transfer)
                break;
            case "prepareSwapTransaction":
                const swapToken = getTokenDetailsByContract(action.content.tokenIn.address)
                const swapTokenDecimal = swapToken?.decimals || 18
                const swapTokenAmount = parseUnits(action.content.amount.toString(), swapTokenDecimal)
                const swap = constructSwapAction(action.content.tokenIn.address, action.content.tokenOut.address, swapTokenAmount.toString())
                bundleList.push(swap)
                break;
            default:
                continue;
        }

    }

    return bundleList
}

export const triggerBundleRoute = async (query: { chainId: number, fromAddress: string }, body: { protocol: string, action: string, args: any }[]): Promise<BundleItem[]> => {
    const req = await EnsoAgent.post("/shortcuts/bundle", body, {
        params: {
            ...query
        },

    },
    )

    const data = req?.data


    let response = { ...data }
    response = { ...response, ...data.tx }
    delete response.tx

    return response
}


export const triggerSwapRoute = async (body: { chainId: number, fromAddress: string, tokenIn: string, tokenOut: string, amountIn: string }): Promise<BundleItem[]> => {
    const req = await EnsoAgent.get("/shortcuts/route", {
        params: {
            ...body
        }
    }
    )

    const data = req?.data


    let response = { ...data }
    response = { ...response, ...data.tx }
    delete response.tx

    return response
}

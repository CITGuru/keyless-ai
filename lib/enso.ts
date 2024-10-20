import axios from "axios"
import { ENSO_API_KEY } from "./constants";


const BASE_URL = "http://api.enso.finance/api/v1/"


export const EnsoAgent = axios.create({
    baseURL: BASE_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENSO_API_KEY}`
    },
});

export const constructTransferAction = (token: string, recipient: string, amount: string) => {
    return {
        "protocol": "enso",
        "action": "transfer",
        "args": {
            "token": token,
            "recipient": recipient,
            "amount": amount
        }
    }
}

export const constructSwapAction = (tokenIn: string, tokenOut: string, amount: string) => {
    return {
        "protocol": "enso",
        "action": "route",
        "args": {
            "tokenIn": tokenIn,
            "tokenOut": tokenOut,
            "amountIn": amount
        }
    }
}


export interface BundleAction {
    protocol: string;
    action: string;
    args: Record<string, string>;
}

export const constructBundleRequest = (actions: { type?: string, content: Record<string, string> }[]): BundleAction[] => {
    const bundleList: BundleAction[] = [];

    for (const action of actions) {
        switch (action.type) {
            case "prepareTransaction":
                const transfer = constructTransferAction(action.content.token, action.content.receiver, action.content.amount);
                bundleList.push(transfer);
                break;
            case "prepareSwapTransaction":
                const swap = constructSwapAction(action.content.tokenIn, action.content.tokenOut, action.content.amount);
                bundleList.push(swap);
                break;
            default:
                throw new Error("Not supported");
        }
    }

    return bundleList;
}

export const triggerBundleRoute = async (query: { chainId: number, fromAddress: string }, body: { protocol: string, action: string, args: any }): Promise<EnsoResponse> => {
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


export const triggerSwapRoute = async (body: { chainId: number, fromAddress: string, tokenIn: string, tokenOut: string, amountIn: number }): Promise<EnsoResponse> => {
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

interface EnsoResponse {
    // Define the structure of your Enso response here
    // For example:
    status: string;
    data: unknown;
}

async function fetchFromEnso(endpoint: string, params: Record<string, unknown>): Promise<EnsoResponse> {
    // Your implementation here
    // ...
    return {
        status: 'success',
        data: {} // Replace with actual data
    };
}

// Usage
// const result = await fetchFromEnso('/some-endpoint', { key: 'value' });

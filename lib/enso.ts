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


export const constructBundleRequest = (actions: { type?: string, content: { [x: string]: any } }[]) => {
    let bundleList: {}[] = []

    for (const action of actions) {
        switch (action.type) {
            case "prepareTransaction":
                const transfer = constructTransferAction(action.content.token, action.content.receiver, action.content.amount)
                bundleList.push(transfer)
            case "prepareSwapTransaction":
                const swap = constructSwapAction(action.content.tokenIn, action.content.tokenOut, action.content.amount)
                bundleList.push(swap)

            default:
                throw new Error("Not supported")
        }

    }

    return bundleList
}

export const triggerBundleRoute = async (query: { chainId: number, fromAddress: string }, body: { protocol: string, action: string, args: any }) => {
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


export const triggerSwapRoute = async (body: { chainId: number, fromAddress: string, tokenIn: string, tokenOut: string, amountIn: number }) => {
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
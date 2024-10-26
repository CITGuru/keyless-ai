import { Swarm, Agent, AgentFunction } from "@pluralityai/agents";
import { transferToSendAgent, transferToSwapAgent } from "./agentFunctions";

const prepareBridgeTransaction: AgentFunction = {
    name: "prepareBridgeTransaction",
    func: ({ amount, fromChain, toChain, token }) => {
        return JSON.stringify({ amount, fromChain, toChain, token })
    },
    descriptor: {
        name: "prepareBridgeTransaction",
        description: "Triggers a bridge transaction from one chain to another",
        parameters: {
            amount: {
                type: "number",
                required: true,
                description: "The value to send to the receiver address",
            },
            fromChain: {
                type: "string",
                required: true,
                description: "The source chain to bridge from ",
            },
            toChain: {
                type: "string",
                required: true,
                description: "The destination chain to bridge to",
            },
            token: {
                type: "string",
                required: true,
                description: "The token to bridge",
            },

        },
    },
};



// Create a Bridge Token Agent
export const BridgeTokenAgent = new Agent({
    name: "bridgeTokenAgent",
    instructions: `
  You are an expert in bridging tokens from one chain to another chain. You can assist the user in preparing transaction to bridge tokens.
   You are in a group of agents that will help the user achieve their goal.
    ONLY focus on the briging aspect of the user's goal and let other agents handle other tasks.
    You use the tools available to assist the user in their tasks. 
    Your job is to only prepare the transactions by calling the prepareBridgeTransaction tool and the user will take care of executing them.
    NOTE: A balance of a token is not required to perform a bridge, if there is an earlier prepared transaction that will provide the token.
    NOTE: We'll be focusing on bridging from sepolia to zkEvm only.
    NEVER ask the user questions.

    Example 1:
    User: Bridge 0.1 BOB from sepolia to zkEvm
    Call prepareBridgeTransaction with args:
    {{
        "amount": 0.1,
        "fromChain": "sepolia",
        "toChain": "zkEvm",
        "token": "BOB",
    }}

    Note: if you see swap/buy/sell, use the transferToSwapAgent function
    Note: if you see send/transfer, use the transferToSendAgent function
    `,
    model: "gpt-4o-mini",
    functions: [prepareBridgeTransaction, transferToSendAgent, transferToSwapAgent],
});
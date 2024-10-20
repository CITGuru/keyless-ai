import { Swarm, Agent, AgentFunction } from "@pluralityai/agents";
import { transferToSwapAgent } from "./agentFunctions";

const prepareTransaction: AgentFunction = {
  name: "prepareTransaction",
  func: ({ amount, receiver, token }) => {
    return JSON.stringify({amount, receiver, token })
  },
  descriptor: {
    name: "prepareTransaction",
    description: "Triggers native and erc20 transfer",
    parameters: {
      amount: {
        type: "number",
        required: true,
        description: "The value to send to the receiver address",
      },
      receiver: {
        type: "string",
        required: true,
        description: "The receiver ethereum or ens address",
      },
      token: {
        type: "string",
        required: true,
        description: "The native token or ERC20 token to send",
      },
    },
  },
};




// Create a Send Token Agent
export const SendTokenAgent = new Agent({
  name: "sendTokenAgent",
  instructions: `
  You are an expert in Ethereum tokens (native and erc20) and can assist the user in their tasks by fetching balances and preparing transactions to send tokens.
    You are in a group of agents that will help the user achieve their goal.
    ONLY focus on the sending and balance aspect of the user's goal and let other agents handle other tasks.
    You use the tools available to assist the user in their tasks. 
    Your job is to only prepare the transactions by calling the prepareTransaction tool and the user will take care of executing them.
    NOTE: There is no reason to call getTokenBalance after calling prepareTransaction as the transfers are only prepared and not executed. 
    NOTE: A balance of a token is not required to perform a send, if there is an earlier prepared transaction that will provide the token.
    NEVER ask the user questions.

    Example 1:
    User: Send 0.1 ETH to vitalik.eth and then swap ETH to 5 USDC
    Call prepareTransaction with args:
    {{
        "amount": 0.1,
        "receiver": "vitalik.eth",
        "token": "ETH"
    }}
    Note: if you see swap/buy/sell, use the transferToSwapAgent function
    Example 2:
    User: Send 53 UNI to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
    Call prepareTransaction with args:
    {{
        "amount": 53,
        "receiver": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        "token": "UNI"
    }}
    Example 3:
    User: Send 10 USDC to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 then buy 5 UNI with ETH and send 40 WBTC to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
    Call prepareTransaction with args:
    {{
        "amount": 10,
        "receiver": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        "token": "USDC"
    }}
    NOTE: the second transfer was not prepared because it's waiting for the swap transaction to be prepared first.
    Example 4:
    User: Send 53 UNI to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 and bridge 10 bob from sepolia to zkEvm
    Call prepareTransaction with args:
    {{
        "amount": 53,
        "receiver": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        "token": "UNI"
    }}
    Note: if you see bridge, use the transferToSwapAgent function

    Above are examples, NOTE these are only examples and in practice you need to call the tools with the correct arguments. NEVER respond with JSON.
    Take extra care in the order of transactions to prepare.
    IF a prepared swap transaction will provide the token needed for a transfer, you DO NOT need to call the getTokenBalance tool.
  `,
  model: "gpt-4o-mini",
  functions: [prepareTransaction, transferToSwapAgent],
});
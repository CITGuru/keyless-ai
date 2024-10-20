import { Swarm, Agent, AgentFunction } from "@pluralityai/agents";
import { SendTokenAgent, SwapTokenAgent } from "./index";

// const prepareTransaction: AgentFunction = {
//   name: "prepareTransaction",
//   func: ({ amount, receiver, token }) => {
//     return JSON.stringify({amount, receiver, token })
//   },
//   descriptor: {
//     name: "prepareTransaction",
//     description: "Triggers native and erc20 transfer",
//     parameters: {
//       amount: {
//         type: "number",
//         required: true,
//         description: "The value to send to the receiver address",
//       },
//       receiver: {
//         type: "string",
//         required: true,
//         description: "The receiver ethereum or ens address",
//       },
//       token: {
//         type: "string",
//         required: true,
//         description: "The native token or ERC20 token to send",
//       },
//     },
//   },
// };

const transferToSwapAgent: AgentFunction = {
  name: "transferToSwapAgent",
  func: () => {
    console.log("Transferring to Swap Agent");
    return SwapTokenAgent;
  },
  descriptor: {
    name: "transferToSwapAgent",
    description: "Transfer swap interactions to Swap Token Agent",
    parameters: {},
  },
};

const transferToSendTokenAgent: AgentFunction = {
    name: "transferToSendAgent",
    func: () => {
      console.log("Transferring to Send Agent");
      return SendTokenAgent;
    },
    descriptor: {
      name: "transferToSendAgent",
      description: "Transfer send interactions to Send Token Agent",
      parameters: {},
    },
  };
  


// Create a Send Token Agent
export const AssistantAgent = new Agent({
  name: "AssistAgent",
  instructions: `
  You are a personal assistant AI agent that's an Expert in plannig and generating transactions on Ethereum. 
  By utilizing other agents and their tools, assist the user in navigating operations such as swaps, send/transfer and bridge on Ethereum.

  When dealing with Ethereum transactions, assume the following:
    - When the user want to execute transactions they mean to prepare the transactions.
    - The agents can also research, discuss, plan actions and advise the user. All of that is in the scope of the agents.

  You must analyze the user query and pass it along in parallel to the right agents.

  The available agents and tools:
  SendTokenAgent - prepareTransaction
  SwapTokenAgent - prepareSwapTransaction

  To ensure you hand off correctly to the right agents:

  Use the transferToSendAgent function for tasks that has to do with send/transfer
  Use the transferToSwapAgent function for tasks that has to do with swap/buy/sell

  `,
  model: "gpt-4o-mini",
  functions: [transferToSendTokenAgent, transferToSwapAgent],
  parallel_tool_calls: true
});
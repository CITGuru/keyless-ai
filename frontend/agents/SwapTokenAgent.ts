import { Swarm, Agent, AgentFunction } from "@pluralityai/agents";
import { SendTokenAgent } from ".";

const prepareSwapTransaction: AgentFunction = {
  name: "prepareSwapTransaction",
  func: ({ tokenIn, tokenOut, amount }) => {
    console.log("Testing")
    return JSON.stringify({ tokenIn, tokenOut, amount })
  },
  descriptor: {
    name: "prepareSwapTransaction",
    description: "Triggers native and erc20 transfer",
    parameters: {
      tokenIn: {
        type: "string",
        required: true,
        description: "The token to swap from",
      },
      tokenOut: {
        type: "string",
        required: true,
        description: "The token to swap to",
      },
      amount: {
        type: "string",
        required: true,
        description: "The value of token to swap from",
      },
    },
  },
};


const transferToSendAgent: AgentFunction = {
  name: "transferToSendAgent",
  func: () => {
    console.log("Transferring to Send Token Agent");
    return SendTokenAgent;
  },
  descriptor: {
    name: "transferToSendAgent",
    description: "Transfer send interactions to Send Token Agent",
    parameters: {},
  },
};


// Create a Send Token Agent
export const SwapTokenAgent = new Agent({
  name: "SwapTokenAgent",
  instructions: `
 You are an expert at buying and selling tokens. Assist the user in their task of swapping tokens.
    ONLY focus on the buy and sell (swap) aspect of the user's goal and let other agents handle other tasks.
    You use the tools available to assist the user in their tasks.
    Note a balance of a token is not required to perform a swap, if there is an earlier prepared transaction that will provide the token.
    Below are examples, NOTE these are only examples and in practice you need to call the prepareSwapTransaction tool with the correct arguments.
    NEVER ask the user questions.
    Example 1:
    User: Send 0.1 ETH to vitalik.eth and then swap ETH to 5 USDC
    ...
    Other agent messages
    ...
    Call prepareSwapTransaction: "ETH to 5 USDC"
    Example 1:
    User: Buy 10 USDC with ETH and then buy UNI with 5 USDC
    Call prepareSwapTransaction: "ETH to 10 USDC\n5 USDC to UNI"
    Example 2:
    User: Buy UNI, WBTC, USDC and SHIB with 0.92 ETH
    Call prepareSwapTransaction: "0.23 ETH to UNI\n0.23 ETH to WBTC\n0.23 ETH to USDC\n0.23 ETH to SHIB"
    Example 3:
    User: Swap ETH to 5 USDC, then swap that USDC for 6 UNI
    Call prepareSwapTransaction: "ETH to 5 USDC\nUSDC to 6 UNI"

    Example 4:
    User: Buy 2 ETH worth of WBTC and then send 1 WBTC to 0x123..456
    Call prepareSwapTransaction: "2 ETH to WBTC"
    Note: if you see send/transfer, use the transferToSendAgent function

    Example of a bad input:
    User: Swap ETH to 1 UNI, then swap UNI to 4 USDC
    Call prepareSwapTransaction: "ETH to 1 UNI\n1 UNI to 4 USDC"
    Prepared transaction: Swap 1.0407386618866115 ETH for at least 1 WBTC
    Invalid input: "1 UNI to 4 USDC". Only one token amount should be provided. IMPORTANT: Take another look at the user's goal, and try again.
    In the above example, you recover with:
    Call prepareSwapTransaction: "UNI to 4 USDC"

    Above are examples, NOTE these are only examples and in practice you need to call the prepareSwapTransaction tool with the correct arguments.
    Take extra care in ensuring you have to right amount next to the token symbol. NEVER use more than one amount per swap, the other amount will be calculated for you.
    The swaps are NOT NECESSARILY correlated, focus on the exact amounts the user wants to buy or sell (leave the other amounts to be calculated for you).
    You rely on the other agents to provide the token to buy or sell. Never make up a token. Unless explicitly given the name of the token, ask the 'research-tokens' agent to first search for the token.
    Only call tools, do not respond with JSON.
  `,
  model: "gpt-4o",
  functions: [prepareSwapTransaction, transferToSendAgent],
});
import { NATIVE_TOKEN_ADDRESS } from "@/lib/constants";
import { ETHAddress, getERC20Balance, getNativeBalance } from "../lib/utils";
import { AgentFunction } from "@pluralityai/agents";

export const getTokenBalanceAgentFunction: AgentFunction = {
    name: "getTokenBalance",
    func: async ({ address, contractAddress }) => {
        let from = new ETHAddress(address)
        await from.resolve()

        let balance

        if (from.hex == NATIVE_TOKEN_ADDRESS) {
            balance = await getNativeBalance(address)
        } else {
            balance = await getERC20Balance(address, contractAddress)
        }

        return balance

    },
    descriptor: {
        name: "getTokenBalance",
        description: "Triggers native and erc20 transfer",
        parameters: {
            address: {
                type: "string",
                required: true,
                description: "The value to send to the receiver address",
            },
            contractAddress: {
                type: "string",
                required: false,
                description: "The native token or ERC20 token to send",
            },
        },
    },
};
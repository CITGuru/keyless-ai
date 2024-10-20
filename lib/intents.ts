import { parseEther } from "viem";
import { NATIVE_TOKEN_ADDRESS } from "./constants";
import { buildTransferERC20, buildTransferNative, ETHAddress } from "./utils";
import { triggerSwapRoute } from "./enso";

enum IntentType {
    SEND = "send",
    SWAP = "swap"
}

interface Token {
    symbol: string;
    address: string;
}

interface NetworkInfo {
    chain_id: number;
}

// interface Transaction {
//     // Add transaction structure here as needed
// }

interface TxParams {
    // If you don't have any specific parameters yet, you can use a more generic type
    [key: string]: any;

    // to?: string;
    // value?: string;
    // data?: string;
    // // Add other known parameters
}

abstract class IntentBase {
    type: IntentType;
    summary: string;

    constructor(type: IntentType, summary: string) {
        this.type = type;
        this.summary = summary;
    }

    abstract buildTransaction(network: NetworkInfo, smartWalletAddress: string): any;
}

class SendIntent extends IntentBase {
    receiver: string;
    token: Token;
    amount: number;

    private constructor(token: Token, amount: number, receiver: string) {
        super(IntentType.SEND, `Transfer ${amount} ${token.symbol} to ${receiver}`);
        this.receiver = receiver;
        this.token = token;
        this.amount = amount;
    }

    static create(token: Token, amount: number, receiver: string): SendIntent {
        return new SendIntent(token, amount, receiver);
    }

    async buildTransaction(network: NetworkInfo, smartWalletAddress: string) {
        let tx: TxParams;

        const receiverAddress = new ETHAddress(this.receiver)

        await receiverAddress.resolve()

        const receiver = receiverAddress.hex || this.receiver

        if (this.token.address === NATIVE_TOKEN_ADDRESS) {
            tx = buildTransferNative(smartWalletAddress, receiver, this.amount);
        } else {
            tx = await buildTransferERC20(this.token.address, receiver, this.amount, smartWalletAddress);
        }

        console.log(this.amount, NATIVE_TOKEN_ADDRESS, tx)
        return tx;
    }
}

class SwapIntent extends IntentBase {
    fromToken: Token;
    toToken: Token;
    amount: number;

    private constructor(fromToken: Token, toToken: Token, amount: number) {
        super(IntentType.SWAP, `Swap amount worth of ${amount} from ${fromToken.symbol} to ${toToken.symbol}`);
        this.fromToken = fromToken;
        this.toToken = toToken;
        this.amount = amount;
    }

    static create(fromToken: Token, toToken: Token, amount: number): SwapIntent {
        return new SwapIntent(fromToken, toToken, amount);
    }

    async buildTransaction(network: NetworkInfo, fromAddress: string) {

        const req = await triggerSwapRoute({ fromAddress: fromAddress, chainId: network.chain_id, tokenIn: this.fromToken.address, tokenOut: this.toToken.address, amountIn: this.amount })
        return req

    }
}


type Intent = SendIntent | SwapIntent

export function loadIntent(intentData: Record<string, any>): Intent {
    switch (intentData.type) {
        case IntentType.SEND:
            return SendIntent.create(
                {
                    symbol: intentData.token.symbol,
                    address: intentData.token.address,
                },
                intentData.amount,
                intentData.receiver
            );
        case IntentType.SWAP:
            return SwapIntent.create(
                {
                    symbol: intentData.from_token.symbol,
                    address: intentData.from_token.address,
                },
                {
                    symbol: intentData.to_token.symbol,
                    address: intentData.to_token.address,
                },
                intentData.amount
            );
        default:
            throw new Error(`Unknown intent type: ${intentData.type}`);
    }
}

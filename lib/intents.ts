import { parseEther, parseUnits } from "viem";
import { NATIVE_TOKEN_ADDRESS } from "./constants";
import { buildTransferERC20, buildTransferNative, ETHAddress, getTokenDetailsByContract } from "./utils";
import { triggerSwapRoute } from "./enso";
import { constructBridgeTransaction } from "./bridgeEthPolygon";

enum IntentType {
    SEND = "send",
    SWAP = "swap",
    BRIDGE = "bridge"
}

interface Token {
    symbol: string;
    address: string;
}

interface Chain {
    chain_id: number;
    name?: string
}

interface TxParams {
    // Add parameters for the transaction as needed
    [key: string]: unknown;
}

abstract class IntentBase {
    type: IntentType;
    summary: string;

    constructor(type: IntentType, summary: string) {
        this.type = type;
        this.summary = summary;
    }

    abstract buildTransaction(network: Chain, smartWalletAddress: string): any;
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

    async buildTransaction(network: Chain, smartWalletAddress: string) {
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

    async buildTransaction(network: Chain, fromAddress: string) {
        const token = getTokenDetailsByContract(this.fromToken.address)

        const decimal = token?.decimals || 18

        const amount = parseUnits(this.amount.toString(), decimal)

        const req = await triggerSwapRoute({ fromAddress: fromAddress, chainId: network.chain_id, tokenIn: this.fromToken.address, tokenOut: this.toToken.address, amountIn: amount.toString() })
        return req

    }
}


class BridgeIntent extends IntentBase {
    fromChain: Chain;
    toChain: Chain;
    token: Token;
    amount: number;

    private constructor(fromChain: Chain, toChain: Chain, token: Token, amount: number) {
        super(IntentType.BRIDGE, `Bridge amount worth of ${amount} ${token.symbol} from ${fromChain.name} to  ${toChain.name}`);
        this.fromChain =fromChain;
        this.toChain =toChain
        this.amount = amount;
        this.token = token;

    }

    static create(fromChain: Chain, toChain: Chain, token: Token, amount: number): BridgeIntent {
        return new BridgeIntent(fromChain, toChain, token, amount);
    }

    async buildTransaction(network: Chain, fromAddress: string) {
        const token = getTokenDetailsByContract(this.token.address)

        const decimal = token?.decimals || 18

        const amount = parseUnits(this.amount.toString(), decimal)

        const req = await constructBridgeTransaction(fromAddress,this.token.address, amount)
        return req

    }
}


type Intent = SendIntent | SwapIntent | BridgeIntent

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
                    symbol: intentData.tokenIn.symbol,
                    address: intentData.tokenIn.address,
                },
                {
                    symbol: intentData.tokenOut.symbol,
                    address: intentData.tokenOut.address,
                },
                intentData.amount
            );
        case IntentType.BRIDGE:
            return BridgeIntent.create(
                {
                    chain_id: intentData.fromChain.chain_id,
                    name: intentData.fromChain.name,
                },
                {
                    chain_id: intentData.toChain.chain_id,
                    name: intentData.toChain.name,
                },
                {
                    symbol: intentData.token.symbol,
                    address: intentData.token.address,
                },
                intentData.amount
            );
        default:
            throw new Error(`Unknown intent type: ${intentData.type}`);
    }
}

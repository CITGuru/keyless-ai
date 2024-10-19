// enum IntentType {
//     SEND = "send",
//     BUY = "buy",
//     SELL = "sell",
// }

// interface Token {
//     symbol: string;
//     address: string;
// }

// interface NetworkInfo {
//     chain_id: number;
// }

// interface ETHAddress {
//     original_str: string;
// }

// interface Transaction {
//     // Add transaction structure here as needed
// }

// interface TxParams {
//     // Add parameters for the transaction as needed
// }

// abstract class IntentBase {
//     type: IntentType;
//     summary: string;

//     constructor(type: IntentType, summary: string) {
//         this.type = type;
//         this.summary = summary;
//     }

//     abstract buildTransactions(web3: any, network: NetworkInfo, smartWalletAddress: ETHAddress): Promise<Transaction[]>;
// }

// class SendIntent extends IntentBase {
//     receiver: string;
//     token: Token;
//     amount: number;

//     private constructor(token: Token, amount: number, receiver: string) {
//         super(IntentType.SEND, `Transfer ${amount} ${token.symbol} to ${receiver}`);
//         this.receiver = receiver;
//         this.token = token;
//         this.amount = amount;
//     }

//     static create(token: Token, amount: number, receiver: ETHAddress): SendIntent {
//         return new SendIntent(token, amount, receiver.original_str);
//     }

//     async buildTransactions(web3: any, network: NetworkInfo, smartWalletAddress: ETHAddress): Promise<Transaction[]> {
//         let tx: TxParams;

//         if (this.token.address === 'NATIVE_TOKEN_ADDRESS') {
//             tx = buildTransferNative(web3, smartWalletAddress, this.receiver, this.amount);
//         } else {
//             tx = buildTransferERC20(web3, this.token.address, this.receiver, this.amount, smartWalletAddress);
//         }

//         const transactions: Transaction[] = [
//             {
//                 // Mock transaction creation logic
//                 token: this.token,
//                 amount: this.amount,
//                 receiver: this.receiver,
//                 params: tx,
//             }
//         ];

//         return transactions;
//     }
// }

// class BuyIntent extends IntentBase {
//     fromToken: Token;
//     toToken: Token;
//     amount: number;

//     private constructor(fromToken: Token, toToken: Token, amount: number) {
//         super(IntentType.BUY, `Buy ${amount} ${toToken.symbol} with ${fromToken.symbol}`);
//         this.fromToken = fromToken;
//         this.toToken = toToken;
//         this.amount = amount;
//     }

//     static create(fromToken: Token, toToken: Token, amount: number): BuyIntent {
//         return new BuyIntent(fromToken, toToken, amount);
//     }

//     async buildTransactions(web3: any, network: NetworkInfo, smartWalletAddress: ETHAddress): Promise<Transaction[]> {
//         // const transactions = await buildSwapTransaction(
//         //     web3,
//         //     this.amount,
//         //     this.fromToken.address,
//         //     this.toToken.address,
//         //     smartWalletAddress,
//         //     false,
//         //     network.chain_id
//         // );

//         // return transactions;
//     }
// }

// class SellIntent extends IntentBase {
//     fromToken: Token;
//     toToken: Token;
//     amount: number;

//     private constructor(fromToken: Token, toToken: Token, amount: number) {
//         super(IntentType.SELL, `Sell ${amount} ${fromToken.symbol} for ${toToken.symbol}`);
//         this.fromToken = fromToken;
//         this.toToken = toToken;
//         this.amount = amount;
//     }

//     static create(fromToken: Token, toToken: Token, amount: number): SellIntent {
//         return new SellIntent(fromToken, toToken, amount);
//     }

//     async buildTransactions(web3: any, network: NetworkInfo, smartWalletAddress: ETHAddress): Promise<Transaction[]> {
//         const transactions = await buildSwapTransaction(
//             web3,
//             this.amount,
//             this.fromToken.address,
//             this.toToken.address,
//             smartWalletAddress,
//             true,
//             network.chain_id
//         );

//         return transactions;
//     }
// }

// type Intent = SendIntent | BuyIntent | SellIntent;

// function loadIntent(intentData: Record<string, any>): Intent {
//     switch (intentData.type) {
//         case IntentType.SEND:
//             return SendIntent.create(
//                 {
//                     symbol: intentData.token.symbol,
//                     address: intentData.token.address,
//                 },
//                 intentData.amount,
//                 { original_str: intentData.receiver }
//             );
//         case IntentType.BUY:
//             return BuyIntent.create(
//                 {
//                     symbol: intentData.from_token.symbol,
//                     address: intentData.from_token.address,
//                 },
//                 {
//                     symbol: intentData.to_token.symbol,
//                     address: intentData.to_token.address,
//                 },
//                 intentData.amount
//             );
//         case IntentType.SELL:
//             return SellIntent.create(
//                 {
//                     symbol: intentData.from_token.symbol,
//                     address: intentData.from_token.address,
//                 },
//                 {
//                     symbol: intentData.to_token.symbol,
//                     address: intentData.to_token.address,
//                 },
//                 intentData.amount
//             );
//         default:
//             throw new Error(`Unknown intent type: ${intentData.type}`);
//     }
// }

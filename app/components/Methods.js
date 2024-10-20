'use client';
import { useState, useEffect } from 'react';
import { useDynamicContext, useIsLoggedIn, useUserWallets } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from '@dynamic-labs/ethereum'
import CustomChatbot from './custom-chatbot'
import SignaturePopup from './signature-popup'
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
// import TransactionDetailsPopup from './transaction-details-popup';

import './Methods.css';

export default function DynamicMethods({ isDarkMode }) {
    const isLoggedIn = useIsLoggedIn();
    const { sdkHasLoaded, primaryWallet, user, } = useDynamicContext();
    const userWallets = useUserWallets();
    const [isLoading, setIsLoading] = useState(true);
    const [result, setResult] = useState('');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isSignaturePopupOpen, setIsSignaturePopupOpen] = useState(false);
    const [signatureResolver, setSignatureResolver] = useState(null);
    const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState({});
    const [lastApiRequest, setLastApiRequest] = useState(null);
    const [lastApiResponse, setLastApiResponse] = useState(null);
    const [currentTxData, setCurrentTxData] = useState(null);

    const previewButtons = [
        { text: "Swap 10.0 USDC to ETH", action: () => handleSubmit("Swap 10.0 USDC to ETH") },
        { text: "Send 0.1 ETH to the following address: 0xc6f2Fe91df8548DcAfBEA0076d138b947ED58a4a", action: () => handleSubmit("Send 0.1 ETH to the following address: 0xc6f2Fe91df8548DcAfBEA0076d138b947ED58a4a") },
        { text: "Bridge 0.1 ETH to Polygon at: 0xC4b4F09Af695F5a329a4DBb5BB57C64258b042EB", action: () => handleSubmit("Bridge 0.1 ETH to my Polygon address: 0xC4b4F09Af695F5a329a4DBb5BB57C64258b042EB") },
    ]

    const handleSignatureRequest = async (txData) => {
        setCurrentTxData(txData);
        setIsSignaturePopupOpen(true);
    };

    const handleSign = async () => {
        if (!currentTxData) {
            console.error('No transaction data available');
            return;
        }

        try {
            const wallet = await primaryWallet.getWalletClient();
            const { to, data, from, value } = currentTxData;
            
            // Include the chain information from lastApiRequest
            const chain = lastApiRequest ? lastApiRequest.chain : primaryWallet.chainId;

            const txHash = await wallet.sendTransaction({
                to,
                data,
                from,
                value,
                chain
            });

            console.log('Transaction sent:', txHash);
            // You might want to update the UI to show the transaction was sent successfully
            setIsSignaturePopupOpen(false);
        } catch (error) {
            console.error('Error signing transaction:', error);
            // Handle the error (e.g., show an error message to the user)
        }
    };

    const handleSubmit = async (message) => {
        const requestBody = {
            query: message,
            account: primaryWallet.address,
            chain: await primaryWallet.connector.getNetwork()
        };
        setLastApiRequest(requestBody);

        // const testResponse = {
        //     "actions": [
        //         {
        //             "role": "tool",
        //             "tool_call_id": "call_ef0zSzBAWC5b44zscWytZ9Su",
        //             "tool_name": "prepareTransaction",
        //             "content": {
        //                 "amount": 10,
        //                 "receiver": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        //                 "token": "USDC"
        //             },
        //             "txData": {
        //                 "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        //                 "data": "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000989680",
        //                 "from": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        //                 "value": 0
        //             }
        //         },
        //         {
        //             "role": "tool",
        //             "tool_call_id": "call_AiWcaMEXalz6BKW3RTU3mHyK",
        //             "tool_name": "prepareSwapTransaction",
        //             "content": {
        //                 "tokenIn": "ETH",
        //                 "tokenOut": "UNI",
        //                 "amount": 5
        //             },
        //             "txData": {
        //                 "gas": "408345",
        //                 "amountOut": "8145595148040",
        //                 "priceImpact": 0,
        //                 "createdAt": 21006287,
        //                 "data": "0xffa2ca3b799cd57f2589d9f5f3a00e18be4838d14fa20d1f7ed7dfd770b918ae6dae494e00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000519198595a30081ffffffff816352a56caadc4f1e25cd6c75970fa768a3304e649bd3b227018102ffffffff016675a323dedb77822fcf39eaa9d682f6abe72555ddcd52200101ffffffffff017e7d64d987cab6eed08a191c4c2459daf2f8ed0b6e7a43a3010103ffffffff017e7d64d987cab6eed08a191c4c2459daf2f8ed0b241c59120101ffffffffffff7e7d64d987cab6eed08a191c4c2459daf2f8ed0b0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002400000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000001046b58f2f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000072fa5d89b9f00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000089ba58cc0e8bcbc1108dbd6f33356a136a021c62000000000000000000000000000000000000000000000000000000000000000280012c00000000003b6d03407f8f7dd53d1f3ac1052565e3ff451d7fe666a31180000000000000003b6d03409393fd6c9c36aeff2eb87a100d5cd9bd00d38c30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000072fa5d89b9e",
        //                 "to": "0x7fEA6786D291A87fC4C98aFCCc5A5d3cFC36bc7b",
        //                 "from": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        //                 "value": "5",
        //                 "route": [
        //                     {
        //                         "action": "swap",
        //                         "protocol": "enso",
        //                         "tokenIn": [
        //                             "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        //                         ],
        //                         "tokenOut": [
        //                             "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"
        //                         ]
        //                     }
        //                 ]
        //             }
        
        //         },
        //         {
        //             "role": "tool",
        //             "tool_call_id": "call_7VyGnAqvTKD4YWKyP1deMY78",
        //             "tool_name": "prepareTransaction",
        //             "content": {
        //                 "amount": 40,
        //                 "receiver": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        //                 "token": "WBTC"
        //             },
        //             "txData":  {
        //                 "to": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        //                 "data": "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000ee6b2800",
        //                 "from": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        //                 "value": 0
        //             }
        //         }
        //     ],
        //     "message": "The transactions have been prepared:\n\n1. Sending 10 USDC to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045.\n2. Swapping ETH for 5 UNI.\n3. Sending 40 WBTC to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045. \n\nYou can now proceed to execute them."
        // }
        
        // console.log(testResponse);
        // console.log("End of handleSubmit");
        // return { message: testResponse.message, actions: testResponse.actions };

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (!response.ok) {
                return testResponse;
                // throw new Error(data.error || 'An error occurred while processing your request.');
            }
            setLastApiResponse(data.message);
            // Return the message from the response
            return data.message || 'No message received from the server.';
        } catch (error) {
            console.error('Error:', error);
            throw error; // Re-throw the error to be caught in the CustomChatbot component
        }
    };

    const handleButtonClick = (action) => {
        // Handle button clicks here
        console.log(`Button clicked with action: ${action}`);
    };

    const handleViewTransaction = (txData) => {
        setTransactionDetails(txData);
        setIsTransactionDetailsOpen(true);
    };

    const safeStringify = (obj) => {
        const seen = new WeakSet();
        return JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return '[Circular]';
                }
                seen.add(value);
            }
            return value;
        }, 2);
    };

    useEffect(() => {
        if (sdkHasLoaded && isLoggedIn && primaryWallet) {
            setIsLoading(false);
        }
    }, [sdkHasLoaded, isLoggedIn, primaryWallet]);

    function clearResult() {
        setResult('');
    }

    function showUser() {
        setResult(safeStringify(user));
    }

    function showUserWallets() {
        setResult(safeStringify(userWallets));
    }


    async function fetchPublicClient() {
        if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

        const publicClient = await primaryWallet.getPublicClient();
        setResult(safeStringify(publicClient));
    }

    async function fetchWalletClient() {
        if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

        const walletClient = await primaryWallet.getWalletClient();
        setResult(safeStringify(walletClient));
    }

    async function signMessage() {
        if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

        const signature = await primaryWallet.signMessage("Hello World");

        setResult(signature);
    }


    async function signTransaction() {
        if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

        const wallet = await primaryWallet.getWalletClient();
        wallet.sendTransaction({to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", value: "10000"})

        // setResult(signature);
    }


    return (
        <>
            {!isLoading && (
                <div className="dynamic-methods" data-theme={isDarkMode ? 'dark' : 'light'}>
                    <div className="methods-container">

                    <button className="btn btn-primary" onClick={signTransaction}>Sign Transaction</button>
                        {/* <button className="btn btn-primary" onClick={showUser}>Fetch User</button>
                        <button className="btn btn-primary" onClick={showUserWallets}>Fetch User Wallets</button> */}


                        {isEthereumWallet(primaryWallet) &&
                            <div>
                                <div className="container mx-auto p-4">
                                    <CustomChatbot
                                        previewButtons={previewButtons}
                                        onSubmit={handleSubmit}
                                        onSignatureRequest={handleSignatureRequest}
                                        onViewTransaction={handleViewTransaction}
                                    />
                                    <SignaturePopup
                                        isOpen={isSignaturePopupOpen}
                                        onClose={() => setIsSignaturePopupOpen(false)}
                                        onSign={handleSign}
                                    />
                                    <TransactionDetailsPopup
                                        isOpen={isTransactionDetailsOpen}
                                        onClose={() => setIsTransactionDetailsOpen(false)}
                                        details={transactionDetails}
                                    />
                                </div>
                            
                            </div>  
                        }
                        {/* <button className="btn btn-primary" onClick={fetchPublicClient}>Fetch Public Client</button>
                        <button className="btn btn-primary" onClick={fetchWalletClient}>Fetch Wallet Client</button>
                        <button className="btn btn-primary" onClick={signMessage}>Sign 'Hello World' on Ethereum</button> */}

                    </div>
                    {result && (
                        <div className="results-container">
                            <pre className="results-text">{result}</pre>
                        </div>
                    )}
                    {result && (
                        <div className="clear-container">
                            <button className="btn btn-primary" onClick={clearResult}>Clear</button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
// interface TransactionDetails {
//   transactionId?: string;
//   amount?: string;
//   account?: string;
//   chain?: string;
//   action?: string;
//   tokenIn?: string;
//   tokenOut?: string;
//   [key: string]: any; // Allow for additional properties
// }

// interface TransactionDetailsPopupProps {
//   isOpen: boolean;
//   onClose: () => void;
//   details: TransactionDetails;
// }

export function TransactionDetailsPopup({ isOpen, onClose, details }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Details of the current transaction
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-4 h-[300px] w-full rounded-md border p-4">
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="mb-2">
              <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {JSON.stringify(value)}
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}


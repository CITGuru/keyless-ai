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
    const { sdkHasLoaded, primaryWallet, user } = useDynamicContext();
    const userWallets = useUserWallets();
    const [isLoading, setIsLoading] = useState(true);
    const [result, setResult] = useState('');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isSignaturePopupOpen, setIsSignaturePopupOpen] = useState(false);
    const [signatureResolver, setSignatureResolver] = useState(null);
    const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState({});

    const previewButtons = [
        { text: "Swap 10.0 USDC to ETH", action: () => handleSubmit("Swap 10.0 USDC to ETH") },
        { text: "Send 0.1 ETH to the following address: 0xc6f2Fe91df8548DcAfBEA0076d138b947ED58a4a", action: () => handleSubmit("Send 0.1 ETH to the following address: 0xc6f2Fe91df8548DcAfBEA0076d138b947ED58a4a") },
        { text: "Bridge 0.1 ETH to Polygon at: 0xC4b4F09Af695F5a329a4DBb5BB57C64258b042EB", action: () => handleSubmit("Bridge 0.1 ETH to my Polygon address: 0xC4b4F09Af695F5a329a4DBb5BB57C64258b042EB") },
    ]

    const handleSignatureRequest = async () => {
        setIsSignaturePopupOpen(true);
        // return new Promise<string>((resolve) => {
        //     setSignatureResolver(() => resolve);
        //     setIsSignaturePopupOpen(true);
        // });
        return;
    }

    const handleSign = (signature) => {
        if (signatureResolver) {
            signatureResolver(signature);
            setIsSignaturePopupOpen(false); // Close the popup after signing
        }
    }

    const handleSubmit = async (message) => {
        
        const testResponse = {
            "tools": [
                {
                    "role": "tool",
                    "tool_call_id": "call_OxMRSKAZahnLv2O7bIbycQzy",
                    "tool_name": "prepareSwapTransaction",
                    "content": {
                        "tokenIn": "USDC",
                        "tokenOut": "ETH",
                        "amount": "10.0"
                    }
                },
                {
                    "role": "tool",
                    "tool_call_id": "call_fT8GxxkMHFdkukNW9gKD8Xmn",
                    "tool_name": "prepareSwapTransaction",
                    "content": {
                        "tokenIn": "USDC",
                        "tokenOut": "ETH",
                        "amount": "10.0"
                    }
                }
            ],
            "message": "I have prepared the swap for 10.0 USDC to ETH."
        }
        const testResponse2 = {
            message: "I have prepared the swap for 10.0 USDC to ETH.",
            tools: [
                {
                    role: "tool",
                    tool_call_id: "call_OxMRSKAZahnLv2O7bIbycQzy",
                    tool_name: "prepareSwapTransaction",
                    content: {
                        tokenIn: "USDC",
                        tokenOut: "ETH",
                        amount: "10.0"
                    }
                },
                {
                    role: "tool",
                    tool_call_id: "call_fT8GxxkMHFdkukNW9gKD8Xmn",
                    tool_name: "prepareSwapTransaction",
                    content: {
                        tokenIn: "USDC",
                        tokenOut: "ETH",
                        amount: "10.0"
                    }
                }
            ]
        }
        console.log(testResponse);
        console.log("End of handleSubmit");
        return testResponse.message;

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    "query": message,
                    "account": primaryWallet.address,
                    "chain": primaryWallet.chainId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return testResponse;
                // throw new Error(data.error || 'An error occurred while processing your request.');
            }

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

    const handleViewTransaction = (details) => {
        setTransactionDetails(details);
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



    return (
        <>
            {!isLoading && (
                <div className="dynamic-methods" data-theme={isDarkMode ? 'dark' : 'light'}>
                    <div className="methods-container">
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


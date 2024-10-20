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
    const [storedActions, setStoredActions] = useState([]);
    const [isBatching, setIsBatching] = useState(false);

    // Function to check if there are multiple actions with txData
    const hasMultipleTxData = () => {
        return storedActions.filter(action => action.txData).length > 1;
    };

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

        const chain = (await primaryWallet.connector.getNetwork()).toString();


        try {
            const wallet = await primaryWallet.getWalletClient(chain);
            const { to, data, from, value } = currentTxData;
            
            // Include the chain information from lastApiRequest
            // const chain = (await primaryWallet.connector.getNetwork()).toString();
            console.log('chain', chain);
            const txHash = await wallet.sendTransaction({
                to,
                data,
                from,
                value
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
        const chain = (await primaryWallet.connector.getNetwork()).toString();
        const requestBody = {
            query: message,
            account: primaryWallet.address,
            chain: chain
        };
        setLastApiRequest(requestBody);

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
                throw new Error(data.error || 'An error occurred while processing your request.');
            }

            setLastApiResponse(data);
            // Store the actions
            setStoredActions(prevActions => [...prevActions, ...data.actions]);
            // Return both the message and actions
            return { message: data.message, actions: data.actions, bundleTx: data.bundleTx };
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    };

    // Function to call the batching endpoint (NEEDS WORK)
    const callBatchingEndpoint = async () => {
        const actionsWithTxData = storedActions.filter(action => action.txData);
        if (actionsWithTxData.length <= 1) {
            console.log('Not enough actions to batch');
            return;
        }

        const chain = (await primaryWallet.connector.getNetwork()).toString();

        setIsBatching(true);

        try {
            // Prepare the bundle data
            const bundle = actionsWithTxData.map(action => {
                const baseAction = {
                    type: action.resolved.type,
                    tool: action.tool_name,
                    amount: parseFloat(action.content.amount), // Ensure amount is a number
                };

                if (action.resolved.type === 'swap') {
                    return {
                        ...baseAction,
                        tokenIn: {
                            symbol: action.resolved.tokenIn.symbol,
                            address: action.resolved.tokenIn.address,
                        },
                        tokenOut: {
                            symbol: action.resolved.tokenOut.symbol,
                            address: action.resolved.tokenOut.address,
                        },
                    };
                } else if (action.resolved.type === 'send') {
                    return {
                        ...baseAction,
                        receiver: action.content.receiver,
                        token: {
                            symbol: action.resolved.token.symbol,
                            address: action.resolved.token.address,
                        },
                    };
                }

                return baseAction; // Fallback for any other action types
            });

            // Prepare the request body
            const requestBody = {
                account: primaryWallet.address,
                chain: chain,
                bundle: bundle
            };

            console.log('Request body:', JSON.stringify(requestBody, null, 2));

            const response = await fetch('/api/enso', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error('Batching request failed');
            }

            const data = await response.json();
            console.log('Batching response:', data);

            // Handle the batching response as needed
            // For example, you might want to trigger a transaction signing here
            // or update the UI to show the batched transaction details

            const wallet = await primaryWallet.getWalletClient(chain);
            
            // Include the chain information from lastApiRequest
            // const chain = (await primaryWallet.connector.getNetwork()).toString();
            console.log('chain', chain);
            const bundleHash = await wallet.sendTransaction({
                to,
                data,
                from,
                value
            });

            // Clear the stored actions after successful batching
            setStoredActions([]);

            // Optionally, you can update the UI to show the batching was successful
            // setIsBatchingSuccessful(true);

        } catch (error) {
            console.error('Error in batching:', error);
            // Optionally, you can update the UI to show the error
            // setIsBatchingError(error.message);
        } finally {
            setIsBatching(false);
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

                    {/* <button className="btn btn-primary" onClick={signTransaction}>Sign Transaction</button> */}
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
                                        storedActions={storedActions}
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
                                    {/* Only show the Batch Signings button if there are multiple actions with txData */}
                                    {hasMultipleTxData() && (
                                        <button onClick={callBatchingEndpoint} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                                            Batch Signings
                                        </button>
                                    )}
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




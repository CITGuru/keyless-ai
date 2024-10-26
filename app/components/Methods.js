'use client';
import { useState, useEffect } from 'react';
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
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
    const { sdkHasLoaded, primaryWallet } = useDynamicContext();
    const [isLoading, setIsLoading] = useState(true);
    const [result, setResult] = useState('');
    const [isSignaturePopupOpen, setIsSignaturePopupOpen] = useState(false);
    const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState({});
    const [ setLastApiRequest] = useState(null);
    const [ setLastApiResponse] = useState(null);
    const [currentTxData, setCurrentTxData] = useState(null);
    const [bundleTx, setBundleTx] = useState(null);
    const [setIsBatching] = useState(false);
    const [storedActions, setStoredActions] = useState([]);

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
            // Store the actions and bundleTx
            setStoredActions(data.actions);
            setBundleTx(data.bundleTx); // Assuming the API returns a bundleTx object
            // Return both the message and actions
            return { message: data.message, actions: data.actions };
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    };

    const handleViewTransaction = (txData) => {
        setTransactionDetails(txData);
        setIsTransactionDetailsOpen(true);
    };

    // const safeStringify = (obj) => {
    //     const seen = new WeakSet();
    //     return JSON.stringify(obj, (key, value) => {
    //         if (typeof value === 'object' && value !== null) {
    //             if (seen.has(value)) {
    //                 return '[Circular]';
    //             }
    //             seen.add(value);
    //         }
    //         return value;
    //     }, 2);
    // };

    useEffect(() => {
        if (sdkHasLoaded && isLoggedIn && primaryWallet) {
            setIsLoading(false);
        }
    }, [sdkHasLoaded, isLoggedIn, primaryWallet]);

    function clearResult() {
        setResult('');
    }


    const callBatchingEndpoint = async () => {
        if (!bundleTx) {
            console.error('No bundle transaction data available');
            return;
        }

        setIsBatching(true);

        try {
            const chain = (await primaryWallet.connector.getNetwork()).toString();
            const wallet = await primaryWallet.getWalletClient(chain);
            const { to, data, from, value } = bundleTx;
            
            console.log('Sending bundle transaction:', { to, data, from, value });

            const txHash = await wallet.sendTransaction({
                to,
                data,
                from,
                value
            });

            console.log('Bundle transaction sent:', txHash);
            // You might want to update the UI to show the transaction was sent successfully
            // For example:
            // setTransactionStatus('Bundle transaction sent successfully');
            // setTransactionHash(txHash);

            // Clear the stored actions and bundleTx after successful transaction
            setStoredActions([]);
            setBundleTx(null);

        } catch (error) {
            console.error('Error signing bundle transaction:', error);
            // Handle the error (e.g., show an error message to the user)
            // setTransactionStatus('Error sending bundle transaction: ' + error.message);
        } finally {
            setIsBatching(false);
        }
    };

    return (
        <>
            {!isLoading && (
                <div className="dynamic-methods" data-theme={isDarkMode ? 'dark' : 'light'}>
                    <div className="methods-container">

                
                        {isEthereumWallet(primaryWallet) &&
                            <div>
                                <div className="container mx-auto p-4">
                                    <CustomChatbot
                                        previewButtons={previewButtons}
                                        onSubmit={handleSubmit}
                                        onSignatureRequest={handleSignatureRequest}
                                        onViewTransaction={handleViewTransaction}
                                        onBundleSigning={callBatchingEndpoint}
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
                                </div>
                            
                            </div>  
                        }
                   
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


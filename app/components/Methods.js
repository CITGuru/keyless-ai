'use client';
import { useState, useEffect } from 'react';
import { useDynamicContext, useIsLoggedIn, useUserWallets } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from '@dynamic-labs/ethereum'
import CustomChatbot from './custom-chatbot'
import SignaturePopup from './signature-popup'

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

    const previewButtons = [
        { text: "Swap 10.0 USD to ETH", action: () => handleSubmit("Swap 10.0 USD to ETH") },
        { text: "Send 0.1 ETH to the following address: 0xc6f2Fe91df8548DcAfBEA0076d138b947ED58a4a", action: () => handleSubmit("Send 0.1 ETH to the following address: 0xc6f2Fe91df8548DcAfBEA0076d138b947ED58a4a") },
        { text: "Bridge 0.1 ETH to Polygon at: 0xC4b4F09Af695F5a329a4DBb5BB57C64258b042EB", action: () => handleSubmit("Bridge 0.1 ETH to my Polygon address: 0xC4b4F09Af695F5a329a4DBb5BB57C64258b042EB") },
    ]

    const handleSignatureRequest = () => {
        return new Promise<string>((resolve) => {
        setSignatureResolver(() => resolve)
        setIsSignaturePopupOpen(true)
        })
    }

    const handleSign = (signature) => {
        if (signatureResolver) {
        signatureResolver(signature)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            setMessages([...messages, { role: 'user', content: input }]);
            // Here you would typically call your AI service to get a response
            // For now, we'll just echo the user's input
            setMessages(prevMessages => [...prevMessages, { role: 'ai', content: `You said: ${input}`, buttons: [{ text: 'Example Button', action: 'exampleAction' }] }]);
            setInput('');
        }
    };

    const handleButtonClick = (action) => {
        // Handle button clicks here
        console.log(`Button clicked with action: ${action}`);
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
                                    />
                                    <SignaturePopup
                                    isOpen={isSignaturePopupOpen}
                                    onClose={() => setIsSignaturePopupOpen(false)}
                                    onSign={handleSign}
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
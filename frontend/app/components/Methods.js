'use client';
import { useState, useEffect } from 'react';
import { useDynamicContext, useIsLoggedIn, useUserWallets } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from '@dynamic-labs/ethereum'
import CustomChatbot from './custom-chatbot'
import SignaturePopup from './signature-popup'

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

    const previewButtons = [
        { text: "What services do you offer?", action: () => handleSubmit("What services do you offer?") },
        { text: "How can I get started?", action: () => handleSubmit("How can I get started?") },
        { text: "Tell me about your pricing", action: () => handleSubmit("Tell me about your pricing") },
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



    return (
        <>
            {/* <div className="container mx-auto p-4">
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
            </div> */}
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
                                    />
                                    <SignaturePopup
                                    isOpen={isSignaturePopupOpen}
                                    onClose={() => setIsSignaturePopupOpen(false)}
                                    onSign={handleSign}
                                    />
                                </div>
                            {/* <div className="ai-chat-container flex flex-col h-[500px] w-full max-w-[600px] border border-gray-300 rounded-lg overflow-hidden">
                                <div className="chat-messages flex-grow overflow-y-auto p-4">
                                    {messages.map((message, index) => (
                                        <div key={index} className={`message ${message.role} mb-4`}>
                                            {message.content}
                                            {message.buttons && (
                                                <div className="button-container mt-2">
                                                    {message.buttons.map((button, btnIndex) => (
                                                        <button
                                                            key={btnIndex}
                                                            onClick={() => handleButtonClick(button.action)}
                                                            className="mr-2 mb-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                        >
                                                            {button.text}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="chat-input-container border-t border-gray-300 p-4">
                                    <form onSubmit={handleSubmit} className="flex">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            className="flex-grow mr-2 px-3 py-2 border border-gray-300 rounded"
                                            placeholder="Type your message..."
                                        />
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Send
                                        </button>
                                    </form>
                                </div>
                            </div> */}
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

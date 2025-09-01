import React, { useState, useRef, useEffect } from 'react';

// The API call will be handled directly within this component using fetch.

export default function Chatbot({ currentQuestion }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const chatBoxRef = useRef(null);

    useEffect(() => {
        // Scroll to the bottom of the chatbox when new messages are added
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    // Effect for time-based motivational messages
    useEffect(() => {
        if (!currentQuestion) {
            return;
        }

        const MOTIVATION_DELAY_MS = 5 * 60 * 1000; // 5 minutes

        const motivationTimer = setTimeout(() => {
            const motivationMessage = {
                sender: 'bot',
                text: "You've got this! Every tough problem makes you a stronger programmer. Need a little hint to get started?"
            };
            setMessages(prev => [...prev, motivationMessage]);
        }, MOTIVATION_DELAY_MS);

        return () => {
            clearTimeout(motivationTimer);
        };
    }, [currentQuestion]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        
        if (!isOpen && messages.length === 0) {
            const initialGreeting = currentQuestion
                ? `Hi! Need a hand with the "${currentQuestion.name}" problem?`
                : "Hello! How can I help with your practice session today?";

            setMessages([
                { sender: 'bot', text: initialGreeting }
            ]);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = { sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputValue;
        setInputValue('');
        setLoading(true);

        try {
            // Replaced the service call with a direct fetch to the backend API.
            const response = await fetch('http://localhost:8000/chat/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: currentInput,
                    question_context: currentQuestion?.name || ""
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const botMessage = { sender: 'bot', text: data.answer };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage = { sender: 'bot', text: "Sorry, I'm having trouble responding right now." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* ✅ NEW: Style block to define the pop-in animation for messages */}
            <style>
                {`
                    @keyframes pop-in {
                        0% {
                            opacity: 0;
                            transform: scale(0.95) translateY(10px);
                        }
                        100% {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                    }
                    .animate-pop-in {
                        animation: pop-in 0.3s ease-out forwards;
                    }
                `}
            </style>

            {/* Floating Chat Button */}
            <button
                onClick={toggleChat}
                className="fixed bottom-5 right-5 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center focus:outline-none hover:bg-blue-700 transition-transform transform hover:scale-110"
                aria-label="Toggle Chat"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
            
            {/* Chat Window with Pop-up Animation */}
            <div
              className={`
                fixed bottom-24 right-5 w-96 h-[32rem] 
                bg-dark-secondary rounded-lg shadow-2xl flex flex-col border border-gray-700
                transition-all duration-300 ease-in-out origin-bottom-right
                ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}
              `}
            >
                {/* Header */}
                <div className="p-4 bg-dark-tertiary text-white font-bold rounded-t-lg border-b border-gray-600">
                    DSA Tutor Bot
                </div>

                {/* Messages */}
                <div ref={chatBoxRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        // ✅ MODIFIED: Added 'animate-pop-in' class to make each message appear with an animation
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-pop-in`}>
                            <div className={`px-4 py-2 rounded-2xl max-w-xs ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start animate-pop-in">
                            <div className="px-4 py-2 rounded-2xl bg-gray-700 text-gray-200">
                                <span className="animate-pulse">...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-600">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask for a hint or solution..."
                        className="w-full px-4 py-2 rounded-lg bg-dark-tertiary text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                </form>
            </div>
        </>
    );
}


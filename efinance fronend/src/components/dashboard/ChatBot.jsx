import React, { useState, useEffect } from 'react';
import './ChatBot.css';

/**
 * ChatBot Component
 * 
 * A floating chat widget that provides AI-powered financial assistance
 * using the Gemini API. The component displays as a floating button
 * that expands into a chat interface when clicked.
 */
const ChatBot = () => {
  // Get Gemini API key from environment variables
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // For debugging - log API key availability and check models
  useEffect(() => {
    // Function to check available models (for debugging)
    const checkAvailableModels = async () => {
      try {
        if (!apiKey) {
          console.error("API key not found");
          return;
        }
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        const data = await response.json();
        
        if (data.models) {
          console.log("Available models:", data.models.map(m => m.name));
        } else {
          console.log("No models found in response:", data);
        }
      } catch (error) {
        console.error("Error checking models:", error);
      }
    };

    if (apiKey) {
      console.log("Gemini API key found");
      checkAvailableModels(); // Check available models for debugging
    } else {
      console.error("Gemini API key not found in environment variables");
    }
  }, [apiKey]);
  
  // State for storing conversation messages
  const [messages, setMessages] = useState([
    // Initial greeting message from the bot
    { text: "Hi! I'm your E-finance assistant. How can I help you today?", isBot: true }
  ]);
  
  // State for the current input message being typed
  const [inputMessage, setInputMessage] = useState('');
  
  // State to control whether chat is open or collapsed to button
  const [isOpen, setIsOpen] = useState(false);
  
  // State to track when AI is generating a response
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles form submission when user sends a message
   * 
   * 1. Prevents default form submission
   * 2. Adds user message to chat
   * 3. Sends request to Gemini API
   * 4. Processes API response and adds to chat
   * 
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Don't proceed if message is empty or already loading
    if (!inputMessage.trim() || isLoading) return;
    
    // Add user message to chat history
    setMessages(prev => [...prev, { text: inputMessage, isBot: false }]);
    
    // Set loading indicator while waiting for AI response
    setIsLoading(true);
    
    // List of current models to try in order of preference
    const modelsToTry = [
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];
    
    try {
      // Check if API key is available
      if (!apiKey) {
        throw new Error("Gemini API key not found in environment variables");
      }
      
      // Prepare the request body with proper formatting
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `You are a helpful financial assistant for E-finance app. Provide clear, accurate advice about personal finance, budgeting, investments, and money management. Keep responses concise and practical. User question: ${inputMessage}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
          candidateCount: 1
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };
      
      let response;
      let lastError;
      
      // Try different models until one works
      for (const model of modelsToTry) {
        try {
          console.log(`Trying model: ${model}`);
          
          // Try v1 API first, then v1beta if that fails
          const apiVersions = ['v1', 'v1beta'];
          let modelResponse;
          
          for (const version of apiVersions) {
            try {
              modelResponse = await fetch(`https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
              });
              
              if (modelResponse.ok) {
                console.log(`Successfully connected with model: ${model} using API ${version}`);
                response = modelResponse;
                break;
              }
            } catch (versionError) {
              console.log(`API ${version} failed for model ${model}:`, versionError.message);
            }
          }
          
          if (response && response.ok) {
            break;
          } else if (modelResponse) {
            const errorData = await modelResponse.json();
            lastError = errorData;
            console.log(`Model ${model} failed:`, errorData);
          }
        } catch (err) {
          console.log(`Model ${model} failed with error:`, err.message);
          lastError = err;
        }
      }
      
      // Check if we got a successful response
      if (!response || !response.ok) {
        console.error('All models failed. Last error:', lastError);
        throw new Error(`All models failed. Last error: ${lastError?.error?.message || lastError?.message || 'Unknown error'}`);
      }
      
      // Parse API response
      const data = await response.json();
      
      // Log the response (for debugging)
      console.log('API Response:', data);
      
      // Check for API errors in the response
      if (data.error) {
        console.error('API returned error:', data.error);
        setMessages(prev => [...prev, { 
          text: `API Error: ${data.error.message || 'Unknown error occurred'}`, 
          isBot: true 
        }]);
        return;
      }
      
      // Extract AI response if available
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { text: aiResponse, isBot: true }]);
      } else if (data.promptFeedback && data.promptFeedback.blockReason) {
        // Handle content filtering blocks
        setMessages(prev => [...prev, { 
          text: `The response was blocked due to content policy (${data.promptFeedback.blockReason}). Please try a different query.`, 
          isBot: true 
        }]);
      } else if (data.candidates && data.candidates.length === 0) {
        // Handle case where no candidates were generated
        setMessages(prev => [...prev, { 
          text: "I couldn't generate a response for that query. Please try rephrasing your question or ask about a different finance topic.", 
          isBot: true 
        }]);
      } else {
        // Handle unexpected response format with more detailed error
        console.error('Unexpected API response structure:', data);
        console.error('Full response:', JSON.stringify(data, null, 2));
        setMessages(prev => [...prev, { 
          text: `I received an unexpected response format. Please check the console for details and try again. Response structure: ${JSON.stringify(Object.keys(data))}`, 
          isBot: true 
        }]);
      }
    } catch (error) {
      // Handle API errors with more detailed error logging
      console.error('Error fetching AI response:', error);
      setMessages(prev => [...prev, { 
        text: `Error: ${error.message || "Unknown error occurred"}. Please try again later.`, 
        isBot: true 
      }]);
    } finally {
      // Reset loading state and clear input field regardless of outcome
      setIsLoading(false);
      setInputMessage('');
    }
  };

  /**
   * Toggles the chat interface between open and closed states
   */
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-container">
      {/* Show chat button when chat is closed */}
      {!isOpen ? (
        <button onClick={toggleChat} className="chatbot-toggle-button">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/4712/4712010.png" 
            alt="Chat with E-finance Assistant" 
            className="chatbot-button-icon" 
          />
        </button>
      ) : (
        /* Show chat interface when open */
        <div className="chatbot-widget">
          {/* Chat header with title and close button */}
          <div className="chatbot-header">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/4712/4712010.png" 
              alt="Bot" 
              className="chatbot-avatar" 
            />
            <div className="chatbot-title-container">
              <h3 className="chatbot-title">E-finance Assistant</h3>
              <p className="chatbot-subtitle">Ask me anything about finance</p>
            </div>
            <button onClick={toggleChat} className="chatbot-close-button">×</button>
          </div>
          
          {/* Messages container - shows conversation history */}
          <div className="chatbot-messages">
            {/* Render each message in the conversation */}
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
                {msg.text}
              </div>
            ))}
            {/* Show loading indicator when waiting for AI response */}
            {isLoading && (
              <div className="message bot loading">
                <div className="loading-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
          
          {/* Input form for user to type and send messages */}
          <form onSubmit={handleSubmit} className="chatbot-input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="chatbot-input"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className={`chatbot-send-button ${isLoading ? 'disabled' : ''}`}
              disabled={isLoading}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
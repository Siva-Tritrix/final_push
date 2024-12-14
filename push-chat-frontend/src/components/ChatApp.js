import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ChatApp.css'; // Import the CSS file

const ChatApp = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (walletAddress) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 50000); // Poll every 10 seconds
      return () => clearInterval(interval);
    }
  }, [walletAddress]);

  const connectWallet = async () => { 
      const signer = await provider.getSigner();
      setWalletAddress(accounts[0]);
      toast.success('Wallet connected!');
      fetchMessages(); // Fetch messages after connecting
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet.');
    }
  };

  const sendMessage = async () => {
    if (!messageContent.trim() || !receiverAddress.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/send-message', {
        receiverAddress,
        messageContent,
      });

      setMessages((prev) => [...prev, { from: walletAddress, content: messageContent }]);
      setMessageContent('');
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message.');
    }
  };

  const fetchMessages = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/get-messages/${walletAddress}`);
    if (response.data.success) {
      setMessages(
        response.data.messages.map((msg) => ({
          from: msg.fromCAIP10 ? msg.fromCAIP10.slice(7) : 'Unknown', // Safely handle undefined
          content: msg.messageContent || 'No content', // Fallback for missing content
        }))
      );
      toast.success('Messages fetched successfully!');
    } else {
      toast.error('Failed to fetch messages.');
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    toast.error('Error fetching messages.');
  }
};


  return (
    <div>
      <h1>Push Chat</h1>
      {!walletAddress ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <div>
            <input
              type="text"
              placeholder="Receiver Address"
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
            />
          </div>
          <div>
            <textarea
              placeholder="Enter your message"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            />
          </div>
          <button onClick={sendMessage}>Send Message</button>
        </div>
      )}
      <div>
        <h2>Messages</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
              <strong>{msg.from === walletAddress ? 'You' : msg.from}:</strong> {msg.content}
            </li>
          ))}
        </ul>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ChatApp;
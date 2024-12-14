const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { ethers } = require('ethers');
const PushAPI = require('@pushprotocol/restapi');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Send a message
app.post('/send-message', async (req, res) => {
  const { receiverAddress, messageContent } = req.body;

  try {
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY);

    const response = await PushAPI.chat.send({
      messageContent,
      messageType: 'Text',
      receiverAddress,
      signer,
    });

    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});




app.get('/get-messages/:walletAddress', async (req, res) => {
    const { walletAddress } = req.params;
  
    try {
      const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
  
      // Decrypt the PGP private key
      const pgpPrivateKey = await PushAPI.chat.decryptPGPKey({
        signer,
        encryptedPGPPrivateKey: process.env.ENCRYPTED_PGP_PRIVATE_KEY, // Store this in your .env
      });
  
      // Fetch messages
      const messages = await PushAPI.chat.chats({
        account: walletAddress,
        toDecrypt: true, // Enable decryption
        pgpPrivateKey: pgpPrivateKey, // Pass the decrypted PGP private key
        env: 'prod', // Use 'staging' for testing
      });
  
      console.log('Fetched messages:', JSON.stringify(messages, null, 2));
      res.status(200).json({ success: true, messages });
    } catch (error) {
      console.error('Error fetching messages:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  
  


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
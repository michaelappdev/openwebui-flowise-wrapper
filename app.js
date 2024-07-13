const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

const FLOWISE_API_URL = process.env.FLOWISE_API_URL;
const FLOWISE_API_KEY = process.env.FLOWISE_API_KEY;

// In-memory store for conversation history
const conversationHistory = {};

// Function to generate a session ID
function getSessionId(req) {
  return req.ip + '-' + new Date().getTime();
}

// Function to summarize conversation history
function summarizeHistory(history) {
  return history.map(entry => `${entry.role}: ${entry.content}`).join('\n');
}

// Handle /v1/models endpoint
app.get('/v1/models', (req, res) => {
  res.json({
    object: 'list',
    data: [
      {
        id: 'flowise-proxy',
        object: 'model',
        created: 0,
        owned_by: 'flowise',
        permission: [],
        root: 'flowise-proxy',
        parent: null
      }
    ]
  });
});

// Middleware to transform OpenAI-style requests to Flowise and vice versa
app.post('/v1/chat/completions', async (req, res) => {
  try {
    // Extract the messages from the OpenAI-style request
    const { messages } = req.body;
    const userMessage = messages[messages.length - 1].content;

    // Determine the session ID
    const sessionId = getSessionId(req);

    // Initialize or update the conversation history for this session
    if (!conversationHistory[sessionId]) {
      conversationHistory[sessionId] = [];
    }
    conversationHistory[sessionId].push({ role: 'user', content: userMessage });

    // Summarize the conversation history to include in the request
    const summarizedHistory = summarizeHistory(conversationHistory[sessionId]);

    // Prepare the data for Flowise
    const flowiseData = {
      question: summarizedHistory,
      overrideConfig: {
        sessionId: sessionId,
        memoryKey: sessionId,
      }
    };

    // Make a request to the Flowise endpoint
    const flowiseResponse = await axios.post(FLOWISE_API_URL, flowiseData, {
      headers: {
        Authorization: `Bearer ${FLOWISE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    // Log the entire Flowise response for debugging
    console.log('Flowise Response:', flowiseResponse.data);

    // Extract the relevant text from Flowise response
    const responseContent = flowiseResponse.data.text || "No content received";

    // Update the conversation history with the assistant's response
    conversationHistory[sessionId].push({ role: 'assistant', content: responseContent });

    // Transform Flowise response to OpenAI format
    const openAIResponse = {
      id: 'chatcmpl-' + Math.random().toString(36).substr(2, 9),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'flowise-proxy',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: responseContent,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
      sessionId: sessionId,
      memoryKey: sessionId,
    };

    res.json(openAIResponse);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
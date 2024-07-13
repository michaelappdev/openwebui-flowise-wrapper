const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const FLOWISE_API_URL = process.env.FLOWISE_API_URL;
const FLOWISE_API_KEY = process.env.FLOWISE_API_KEY;

// Middleware to transform OpenAI-style requests to Flowise and vice versa
app.post('/v1/chat/completions', async (req, res) => {
  try {
    // Extract the message from the OpenAI-style request
    const { messages } = req.body;
    const question = messages[messages.length - 1].content;

    // Prepare the data for Flowise
    const flowiseData = { question };

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
    };

    res.json(openAIResponse);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
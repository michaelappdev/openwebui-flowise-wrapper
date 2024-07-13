# OpenWebUI-Flowise Middleware

## Overview

This project provides a middleware wrapper for the Open WebUI to make it compatible with Flowise. It allows you to send requests formatted for the OpenAI API to Flowise and receive responses in the expected format, effectively acting as an abstraction layer between the two.

## Features

- **Middleware Wrapper**: Translates OpenAI API requests to Flowise requests and vice versa.
- **Secure Configuration**: Uses environment variables to securely manage Flowise URL and API key.
- **Express Server**: A simple Node.js Express server to handle incoming requests and forward them to Flowise.

## Prerequisites

- Node.js and npm installed
- Git installed
- Railway account

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/openwebui-flowise-middleware.git
cd openwebui-flowise-middleware
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of your project and add the following:

```env
FLOWISE_API_URL=<YOUR URL>
FLOWISE_API_KEY=<YOUR API KEY>
```

### 4. Run the Server

```bash
node app.js
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

## Deploying on Railway

### 1. Create a Railway Project

1. Go to [Railway](https://railway.app/) and log in.
2. Create a new project.
3. Select "Deploy from GitHub repo" and authorize Railway to access your GitHub account.
4. Select your repository (`openwebui-flowise-middleware`).

### 2. Configure Environment Variables on Railway

1. Go to the "Settings" tab of your Railway project.
2. Add the following environment variables under the "Environment" section:

   - `FLOWISE_API_URL`
   - `FLOWISE_API_KEY`

3. Set the values as per your Flowise configuration.

### 3. Deploy

Railway will automatically detect the `package.json` file and set up the project. If it doesn't, you can manually trigger a deployment from the Railway dashboard.

## Usage

After deploying the application, you can use the provided URL from Railway as the API base URL in Open WebUI. The middleware will handle transforming requests to Flowise and returning the results in the format expected by Open WebUI.

### Example Request

```javascript
const response = await fetch("https://your-railway-app-url/v1/chat/completions", {
    headers: {
        "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({
        messages: [{ role: "user", content: "Hey, how are you?" }]
    })
});

const result = await response.json();
console.log(result);
```

## License

This project is licensed under the MIT License.
/**
 * File: /api/chat-proxy.js
 * Description: A secure, server-side proxy to handle requests to the Chutes.ai API.
 * This function runs on a server environment (like Vercel, Netlify, or a Node.js server),
 * NOT in the user's browser.
 */

export default async function handler(request, response) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST']);
    return response.status(405).json({ error: `Method ${request.method} Not Allowed` });
  }

  // IMPORTANT: Get the API key from a secure server environment variable.
  const apiKey = process.env.CHUTES_API_TOKEN;

  if (!apiKey) {
    // If the server isn't configured with a key, return a server error.
    console.error('CHUTES_API_TOKEN environment variable not set.');
    return response.status(500).json({ error: 'API key not configured on the server.' });
  }

  try {
    // Get the original request body from our chatbot client
    const clientRequestBody = request.body;

    // SUGGESTION 1 (IMPLEMENTED): Securely add the model name on the server.
    // This prevents the client from choosing the model and provides a single
    // place to update it in the future.
    const modifiedBody = {
      ...clientRequestBody, // Copy `messages`, `temperature`, etc. from the client
      model: "zai-org/GLM-4.5-Air" // Securely set the model here
    };

    // Forward the modified request body to the official Chutes.ai API endpoint.
    const chutesResponse = await fetch("https://llm.chutes.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // The secure API key is added here on the server-side.
        "Authorization": `Bearer ${apiKey}`,
      },
      // Use the new, modified body for the request.
      body: JSON.stringify(modifiedBody),
    });

    // Get the JSON data from the Chutes.ai response.
    const data = await chutesResponse.json();

    // If the Chutes.ai API returns an error, forward it to our client.
    if (!chutesResponse.ok) {
      console.error('Error from Chutes.ai API:', data);
      return response.status(chutesResponse.status).json(data);
    }
    
    // If the request is successful, send the response from Chutes.ai back to our chatbot client.
    response.status(200).json(data);

  } catch (error) {
    // Catch any network errors or other issues during the fetch process.
    console.error("Error in proxy function:", error);
    response.status(500).json({ error: 'An internal server error occurred.' });
  }
}

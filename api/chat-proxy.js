/**
 * File: /api/chat-proxy.js
 * Description: A secure, server-side proxy to handle requests to the Groq API.
 * This function runs on a server environment (like Vercel, Netlify, or a Node.js server),
 * NOT in the user's browser.
 */

export default async function handler(request, response) {
  // Only allow POST requests, which is how the chatbot sends data.
  if (request.method !== 'POST') {
    // If any other method is used, send a "405 Method Not Allowed" error.
    response.setHeader('Allow', ['POST']);
    return response.status(405).json({ error: `Method ${request.method} Not Allowed` });
  }

  // IMPORTANT: Retrieve the API key from a secure environment variable on the server.
  // This keeps the key safe and out of the public-facing code.
  // You will need to set this variable in your deployment platform's settings (e.g., GROQ_API_KEY).
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    // If the server is not configured with the API key, return a server error.
    console.error('GROQ_API_KEY environment variable not set.');
    return response.status(500).json({ error: 'API key not configured on the server.' });
  }

  try {
    // Forward the request body (which contains the message history) from our chatbot client
    // to the official Groq API endpoint.
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // The secure API key is added here, on the server-side, where it's safe.
        "Authorization": `Bearer ${apiKey}`,
      },
      // Pass the message history from our client request directly to Groq.
      body: JSON.stringify(request.body),
    });

    // Get the JSON data from Groq's response.
    const data = await groqResponse.json();

    // If Groq's API returned an error (e.g., bad request, rate limit),
    // pass that error message and status code back to our client.
    if (!groqResponse.ok) {
      console.error('Error from Groq API:', data);
      return response.status(groqResponse.status).json(data);
    }
    
    // If the request was successful, send the response from Groq back to our chatbot client.
    response.status(200).json(data);

  } catch (error) {
    // Catch any network errors or other issues during the fetch process.
    console.error("Error in proxy function:", error);
    response.status(500).json({ error: 'An internal server error occurred.' });
  }
}

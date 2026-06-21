/**
 * File: /api/chat-proxy.js
 * Description: A secure, server-side proxy to handle requests to the Groq API.
 * This function runs on a server environment (like Vercel, Netlify, or a Node.js server),
 * NOT in the user's browser.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-120b";

function normalizeRequestBody(rawBody) {
  if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
    return { error: "Invalid request body. Expected a JSON object." };
  }

  const {
    model: _ignoredModel,
    max_tokens,
    messages,
    temperature,
    logprobs: _ignoredLogprobs,
    logit_bias: _ignoredLogitBias,
    top_logprobs: _ignoredTopLogprobs,
    ...rest
  } = rawBody;

  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: "The request must include a non-empty messages array." };
  }

  if (rest.n !== undefined && rest.n !== 1) {
    return { error: "Groq only supports n=1 for chat completions." };
  }

  if (rest.stream === true) {
    return { error: "Streaming is not supported by this proxy yet." };
  }

  const sanitizedMessages = messages.map((message) => {
    if (!message || typeof message !== "object" || Array.isArray(message)) {
      return null;
    }

    const { name: _ignoredName, ...sanitizedMessage } = message;
    return sanitizedMessage;
  });

  if (sanitizedMessages.some((message) => message === null)) {
    return { error: "Each message must be a JSON object." };
  }

  const normalizedBody = {
    ...rest,
    messages: sanitizedMessages,
    model: GROQ_MODEL,
  };

  if (max_tokens !== undefined && rest.max_completion_tokens === undefined) {
    normalizedBody.max_completion_tokens = max_tokens;
  }

  if (temperature === 0) {
    normalizedBody.temperature = 1e-8;
  } else if (temperature !== undefined) {
    normalizedBody.temperature = temperature;
  }

  return { body: normalizedBody };
}

async function parseUpstreamPayload(upstreamResponse) {
  const contentType = upstreamResponse.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return upstreamResponse.json().catch(() => null);
  }

  const text = await upstreamResponse.text().catch(() => "");
  return text ? { error: text } : null;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", ["POST"]);
    return response.status(405).json({ error: `Method ${request.method} Not Allowed` });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("GROQ_API_KEY environment variable not set.");
    return response.status(500).json({ error: "API key not configured on the server." });
  }

  try {
    const rawBody =
      typeof request.body === "string" ? JSON.parse(request.body) : request.body;
    const { body: normalizedBody, error: validationError } = normalizeRequestBody(rawBody);

    if (validationError) {
      return response.status(400).json({ error: validationError });
    }

    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(normalizedBody),
    });

    const data = await parseUpstreamPayload(groqResponse);

    if (!groqResponse.ok) {
      console.error("Error from Groq API:", data);
      return response.status(groqResponse.status).json(
        data && typeof data === "object"
          ? data
          : { error: "Groq API request failed." }
      );
    }

    if (!data || typeof data !== "object") {
      console.error("Unexpected non-JSON success response from Groq API:", data);
      return response.status(502).json({ error: "Unexpected response format from Groq API." });
    }

    return response.status(200).json(data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return response.status(400).json({ error: "Invalid JSON request body." });
    }

    console.error("Error in Groq proxy function:", error);
    return response.status(500).json({ error: "An internal server error occurred." });
  }
}

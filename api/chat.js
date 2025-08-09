/**
 * File: /api/chat.js
 * Ini adalah Vercel Serverless Function yang berfungsi sebagai perantara (proxy) aman ke Groq API.
 * Fungsi ini membaca API key rahasia dari environment variables di server Vercel,
 * sehingga tidak pernah terekspos ke browser pengguna.
 */
export default async function handler(request, response) {
  // Hanya izinkan metode POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // Ambil prompt sistem dan pesan user dari body request yang dikirim frontend
  const { systemPrompt, userMessage } = request.body;

  if (!systemPrompt || !userMessage) {
    return response.status(400).json({ error: 'System prompt atau user message tidak ada.' });
  }

  // Ambil API Key secara aman dari environment variables Vercel
  // Pastikan nama variabelnya sama dengan yang Anda atur di Vercel
  const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    console.error("GROQ_API_KEY tidak ditemukan di environment variables.");
    return response.status(500).json({ error: 'Konfigurasi API di server bermasalah.' });
  }

  try {
    // Panggil Groq API dari sisi server, bukan dari browser
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        // Kirim kedua pesan (sistem dan user) ke Groq API
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ]
      })
    });

    // Jika Groq API mengembalikan error, teruskan informasinya
    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API Error:", errorText);
      return response.status(groqResponse.status).json({ error: `Groq API error: ${errorText}` });
    }

    // Kirim kembali data yang berhasil didapat dari Groq ke frontend
    const data = await groqResponse.json();
    response.status(200).json(data);

  } catch (error) {
    console.error("Internal Server Error:", error);
    response.status(500).json({ error: 'Terjadi kesalahan internal pada server.' });
  }
}

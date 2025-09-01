const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Groq = require('groq-sdk');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// WAJIB agar mesinwaktufinansial.html bisa diakses
app.use(express.static('public'));

// Inisialisasi Groq SDK
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.post('/produk', async (req, res) => {
  const { total } = req.body;

  if (!total || isNaN(total)) {
    return res.status(400).json({ error: 'Total tabungan tidak valid.' });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
            Anda adalah AI yang memberikan rekomendasi produk berdasarkan budget.
            Anda HARUS mengikuti aturan ini:
            1.  Hanya berikan 4 rekomendasi produk yang relevan dengan budget yang diberikan.
            2.  Nama setiap produk TIDAK BOLEH lebih dari 20 karakter.
            3.  JANGAN memberikan kalimat pembuka, penutup, atau penjelasan apapun.
            4.  Output HARUS dalam format JSON Array of Objects, dimana setiap object memiliki key "nama".
            Contoh output yang BENAR untuk budget Rp50.000:
            [
              {"nama": "Buku Novel Fiksi"},
              {"nama": "Kaos Polos Katun"},
              {"nama": "Voucher Game 120"},
              {"nama": "Paket Nasi Ayam"}
            ]
          `.trim()
        },
        {
          role: "user",
          content: `Saya punya budget Rp${total}. Berikan saya 4 rekomendasi produk.`
        }
      ],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" }
    });

    const reply = chatCompletion.choices[0].message.content;
    const parsedReply = JSON.parse(reply);

    res.json(parsedReply);

  } catch (error) {
    console.error("Error dari Groq API atau parsing JSON:", error);
    res.status(500).json({ error: 'Gagal mendapatkan rekomendasi produk.' });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

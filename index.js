const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Variables de entorno
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'midcco';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; // Token real
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID; // 847828841736316

// Verificación del webhook (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Recepción de mensajes (POST)
app.post('/webhook', async (req, res) => {
  try {
    console.log('📩 Evento recibido:', JSON.stringify(req.body, null, 2));
    res.sendStatus(200);

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    const from = message?.from;
    const text = message?.text?.body;

    if (from && text) {
      await axios.post(
        `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: from,
          type: 'text',
          text: { body: `Recibí: ${text}` }
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Respuesta enviada a', from);
    }
  } catch (err) {
    console.error('❌ Error procesando mensaje:', err.response?.data || err.message);
  }
});

// Ruta raíz para Render
app.get('/', (_req, res) => {
  res.status(200).send('SarAI está corriendo');
});

// Activar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SarAI corriendo en puerto ${PORT}`);
  // Puedes descomentar esta línea si quieres enviar el mensaje al iniciar
  // sendMessage();
});

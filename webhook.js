const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const token = 'EAALhYXnZBJZBQBPesnnuVc3ne0F8kDsUWyHwiN1yOH5LWZAqR9HswOiU3vhRyI3KQAJIvwzPDZBy2TeethWJKjYdxjfKswksPIkskd2TI2gYFZBiKSSVNl2a5ZCYwDgpFT7S0k82epQXpvZA7Qnu4V7lExvmZCmaMZBG4r491usL2minB3RvZCFSBgGFpZAtf2Vb008tc2QQ9oZD';
const phoneNumberId = '717092608164080';

// Verificación del webhook (Meta lo usa para confirmar la URL)
app.get('/webhook', (req, res) => {
  const verifyToken = 'midcco'; // Este es el que debes poner en Meta
  const mode = req.query['hub.mode'];
  const receivedToken = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && receivedToken === verifyToken) {
    console.log('✅ Webhook verificado correctamente');
    res.status(200).send(challenge);
  } else {
    console.warn('❌ Token incorrecto o modo inválido');
    res.sendStatus(403);
  }
});

// Recepción de mensajes entrantes
app.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (message && message.text) {
    const from = message.from;
    const userMessage = message.text.body.trim();

let reply = '🤖 No entendí tu mensaje. Por favor escribe un número del 1 al 6.';

const normalized = userMessage.toLowerCase();

if (['hola', 'buenas', 'hello', 'hi'].includes(normalized)) {
  reply = `👋 *WhatsApp MIJ – Asistente Virtual Museo Judío de Chile*\n\n¡Hola! Bienvenido al Museo Judío de Chile. Soy la asistente virtual SarAI y estoy aquí para ayudarte.\n\nPor favor, selecciona una opción escribiendo el número correspondiente:\n\n📌 Recuerda que para visitar el museo debes agendar previamente en 👉 www.museojudio.cl\n\n1. ℹ️ Información general\n2. 🎟️ Entradas y reservas\n3. 📅 Estado de tu reserva\n4. 🏫 Visitas escolares o institucionales\n5. 🧭 Cómo llegar\n6. 📞 Otras consultas`;
} else {
  switch (userMessage) {
    case '1':
      reply = `ℹ️ *Información general*\n\n• Entrada gratuita, previa reserva en www.museojudio.cl\n• Grupos de más de 7 personas cuentan con guía gratuito. Para grupos menores, la visita guiada tiene un costo de $35.000 por grupo.\n• Recorridos disponibles: Historia del pueblo judío y memoria del Holocausto.\n\n🕒 *Horarios:*\n• Lunes a jueves: 10:00 – 16:00 hrs\n• Viernes: 10:00 – 15:00 hrs\n• Sábados: cerrado\n• Domingos: atención solo vía correo 📩 info@mij.cl\n\n📍 Dirección: Comandante Malbec 13210, Lo Barnechea.\n♿ Accesibilidad: rampa, ascensor y baños adaptados.`;
      break;
    case '2':
      reply = `🎟️ *Entradas y reservas*\n\nLa entrada es gratuita con reserva previa.\n🙏 Si deseas, puedes apoyar al museo con un aporte voluntario en 👉 museojudio.donando.cl`;
      break;
    case '3':
      reply = `📅 *Estado de tu reserva*\n\nPor favor indícanos el correo con el que realizaste la reserva y te confirmaremos en nuestro horario de atención.`;
      break;
    case '4':
      reply = `🏫 *Visitas escolares o institucionales*\n\n• Reservas en www.museojudio.cl\n• Dos recorridos disponibles: Historia del pueblo judío y memoria del Holocausto.\n• Dirigido a mayores de 14 años.\n• Duración: 2 horas.\n• Capacidad: 45 personas por recorrido.\n• Estacionamiento para buses disponible.`;
      break;
    case '5':
      reply = `🧭 *Cómo llegar*\n\n📍 Dirección: Comandante Malbec 13210, Lo Barnechea.\n🚗 Estacionamiento sin costo.\n🚌 Desde Metro Manquehue: buses N°430 o N°426 hasta Mall Portal la Dehesa, luego caminar a Comandante Malbec.\n🚌 Desde Metro Los Domínicos: bus C16 hasta Padre José Arteaga, luego caminar a Comandante Malbec.`;
      break;
    case '6':
      reply = `📞 *Otras consultas*\n\nSi necesitas ayuda personalizada, escríbenos a 📩 info@mij.cl`;
      break;
  }
}
    try {
      await axios.post(
        `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: from,
          text: { body: reply },
          type: 'text'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Respuesta enviada:', reply);
    } catch (error) {
      console.error('❌ Error al responder:', error.response?.data || error.message);
    }
  }

  res.sendStatus(200);
});

// Iniciar servidor
app.listen(3000, () => {
  console.log('🚀 Webhook escuchando en puerto 3000');
});

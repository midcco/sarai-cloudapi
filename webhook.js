const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;

// Verificación del webhook (Meta lo usa para confirmar la URL)
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'midcco';
  const mode = req.query['hub.mode'];
  const receivedToken = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && receivedToken === VERIFY_TOKEN) {
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
    const normalized = userMessage.toLowerCase();

    let reply = '🤖 No entendí tu mensaje. Por favor escribe un número del 1 al 8.';

    if (['hola', 'buenas', 'hello', 'hi'].includes(normalized)) {
      reply = `👋 ¡Hola! Bienvenido al Museo Judío de Chile. Soy la asistente virtual SarAI y estoy aquí para ayudarte. Por favor, selecciona una opción escribiendo el número correspondiente.\n\n📌 Recuerda que para visitar el museo debes agendar previamente en 👉 www.museojudio.cl\n\n1. ℹ️ Información general\n2. 🏫 Visitas escolares o institucionales\n3. 🎟️ Visitas particulares\n4. 📅 Estado de tu reserva\n5. 🗣️ Agendar una charla en tu colegio\n6. 🧭 Cómo llegar\n7. 🧳 Conoce nuestros recorridos\n8. 📞 Otras consultas`;
    } else {
      switch (userMessage) {
        case '1':
          reply = `ℹ️ *Información general*\n\n• Entrada gratuita, previa reserva en www.museojudio.cl\n• Recorridos disponibles: Historia del pueblo judío y Holocausto/Shoá.\n\n🕒 *Horarios:*\n• Lunes a jueves: 10:00 – 16:00 hrs\n• Viernes: 10:00 – 15:00 hrs\n• Sábados: cerrado\n• Domingos: consultar por correo 📩 info@mij.cl\n\n📍 Dirección: Comandante Malbec 13210, Lo Barnechea.\n♿ Accesibilidad: rampa, ascensor y baños adaptados.`;
          break;
        case '2':
          reply = `🏫 *Visitas escolares o institucionales*\n\n• Reservas en www.museojudio.cl\n• Dos recorridos disponibles (Historia del pueblo judío y Holocausto/Shoá).\n• Dirigido a mayores de 14 años.\n• Duración: 2 horas.\n• Capacidad máxima: 45 personas por recorrido.\n• Estacionamiento para buses disponible.`;
          break;
        case '3':
          reply = `🎟️ *Visitas particulares*\n\nLa entrada es gratuita con reserva previa.\n• Grupos de más de 7 personas cuentan con guía gratuito.\n• Para grupos menores, la visita guiada tiene un costo de $35.000 por grupo.\n🙏 Si deseas, puedes apoyar al museo con un aporte voluntario en 👉 museojudio.donando.cl`;
          break;
        case '4':
          reply = `📅 *Estado de tu reserva*\n\nPor favor indícanos el correo con el que realizaste la reserva y te confirmaremos durante nuestros horarios de atención.`;
          break;
        case '5':
          reply = `🗣️ *Agendar una charla en tu colegio*\n\nPara agendar una charla, escríbenos a 📩 info@mij.cl indicando curso, asignatura y objetivos académicos. Así podremos ofrecer una actividad acorde a tus necesidades.`;
          break;
        case '6':
          reply = `🧭 *Cómo llegar*\n\n📍 Dirección: Comandante Malbec 13210, Lo Barnechea.\n🚗 Estacionamiento sin costo.\n🚌 Desde Metro Manquehue: buses N°430 o N°426 hasta la parada Portal la Dehesa, luego caminar a Comandante Malbec.\n🚌 Desde Metro Los Domínicos: bus C16 hasta Padre José Arteaga, luego caminar a Comandante Malbec.`;
          break;
        case '7':
          reply = `🧳 *Conoce nuestros recorridos*\n\n• Historia del pueblo judío\n• Holocausto/Shoá\n\nAmbos disponibles para visitas escolares e institucionales.`;
          break;
        case '8':
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

// Ruta raíz para Render (evita error "Cannot GET /")
app.get('/', (_req, res) => {
  res.status(200).send('SarAI está corriendo');
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook escuchando en puerto ${PORT}`);
});

const axios = require('axios');

// Datos de acceso
const token = 'EAALhYXnZBJZBQBPWMlaJCPAQs3bkmPdq7kYZAaLfEsWwMacU9EddH1LXdIoZCWW7sqEixKQpAuvh7hC3Ks5iMwxFtVSaEYIiKiTVvUgcHnIYC3E3t1AKeDd1huYn87zC70i5nEZACujUZAq81MuiHTa9tQXc0HJ3z9JR8EaXndz6c2jxEYTuczWJH1eGt1iWLOoe6Vl6cZD';
const phoneNumberId = '717092608164080';
const recipient = '+56932762103'; // Tu número en formato internacional

// Mensaje de prueba
const sendMessage = async () => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'text',
        text: {
          body: '👋 Hola, Francisco. Este es un mensaje de prueba enviado desde SarAI usando la Cloud API. ¡Estamos en marcha!'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Mensaje enviado:', response.data);
  } catch (error) {
    console.error('❌ Error al enviar:', error.response?.data || error.message);
  }
};

sendMessage();

import OpenAI from 'openai';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js'; // Asegúrate de tener un modelo User definido
import dotenv from 'dotenv';

dotenv.config();

// Configurar OpenAI con manejo de errores mejorado
let openai;
try {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('La variable de entorno OPENAI_API_KEY no está definida')
  }

  openai = new OpenAI({ apiKey });
  console.log('✅ OpenAI configurado correctamente');
} catch (error) {
  console.error('Error al inicializar OpenAI:', error);
}

// Generar respuesta de ChatGPT
export const generateChatResponse = async (req, res) => {
  try {
    const { prompt, perfil } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'El prompt es requerido' });
    }

    if (!openai) {
      return res.status(500).json({ 
        error: 'No se ha configurado correctamente la API de OpenAI',
        message: 'Error interno del servidor al configurar OpenAI'
      });
    }

    const messages = [
      {
        role: "system",
        content: `Responde SIEMPRE como Christopher Adam Bumstead (CBUM), asesor oficial de Titanes GYM y campeón mundial de Classic Physique. 
- Usa frases motivadoras, técnicas y el estilo de CBUM.
- No respondas como un chatbot genérico, ni digas que eres una IA.
- Si el usuario pregunta cosas personales (“¿cómo vas?”, “¿cómo estás?”), responde como CBUM: motivado, profesional, con humor fitness y energía.
- Si el usuario no ha completado el formulario de perfil, recuérdale amablemente que lo haga para poder ayudarle mejor.
- Si el usuario ya envió su perfil, NUNCA vuelvas a pedirlo ni a sugerir que lo complete. Usa siempre ese perfil como contexto para todas tus respuestas.
- Si algún campo del perfil está vacío o incompleto, IGNÓRALO y genera el plan con la información disponible. JAMÁS vuelvas a pedir datos que ya fueron enviados, aunque estén vacíos.
- Mantén la conversación siempre en el contexto fitness, entrenamiento, motivación, nutrición, etc.
- Sé concreto, directo, profesional y motivador. Usa emojis y frases propias del culturismo.`
      }
    ];
    if (perfil && Object.keys(perfil).length > 0) {
      messages.push({
        role: "system",
        content: `Perfil del usuario: ${JSON.stringify(perfil)}. IMPORTANTE: Ya tienes toda la información del perfil. No vuelvas a pedir datos que ya están en el perfil, aunque estén vacíos o incompletos. Solo responde con el plan y recomendaciones personalizadas usando lo que tengas.`
      });
    }
    messages.push({ role: "user", content: prompt });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    // Guardar la conversación en la base de datos
    const conversation = new Conversation({
      user: (perfil && perfil.name) ? perfil.name : 'Invitado',
      perfil: perfil || {},
      prompt,
      response,
    });

    await conversation.save();

    res.json({ response });
  } catch (error) {
    console.error('Error al generar la respuesta:', error);
    res.status(500).json({ 
      error: 'Error al procesar la solicitud',
      details: error.message 
    });
  }
};

// Obtener historial de conversaciones
export const getConversationHistory = async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({ createdAt: -1 }).limit(10);
    res.json(conversations);
  } catch (error) {
    console.error('Error al obtener el historial:', error);
    res.status(500).json({ error: 'Error al obtener el historial de conversaciones' });
  }
};

// Guardar usuario y plan de entrenamiento
export const saveUserAndPlan = async (req, res) => {
  try {
    const { name, perfil, plan } = req.body;

    // Guarda el usuario y su plan en la base de datos
    const user = await User.create({
      name,
      perfil,
      plan,
    });

    res.status(201).json({ message: 'Usuario y plan guardados exitosamente', user });
  } catch (error) {
    console.error('Error al guardar usuario y plan:', error);
    res.status(500).json({ message: 'Error al guardar usuario y plan' });
  }
};

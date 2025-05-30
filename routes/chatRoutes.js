import express from 'express';
import { generateChatResponse, getConversationHistory, saveUserAndPlan } from '../controllers/chatController.js';

const router = express.Router();

// Ruta para generar respuestas de ChatGPT
router.post('/chat', generateChatResponse);
// Ruta para obtener el historial de conversaciones
router.get('/chat/history', getConversationHistory);
// Ruta para guardar usuarios y planes de entrenamiento
router.post('/save-user-plan', saveUserAndPlan);

export { router };

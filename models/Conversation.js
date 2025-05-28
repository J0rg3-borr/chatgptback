import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  user: {
    type: String,
    required: false // Puede ser opcional si no siempre hay usuario
  },
  perfil: {
    type: Object,
    required: false // Puede ser opcional si no siempre hay perfil
  },
  prompt: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ConversationSchema.index({ user: 1, createdAt: -1 });

// Especificar el nombre de la colección explícitamente
const Conversation = mongoose.model('Conversation', ConversationSchema, 'conversacion');

export default Conversation;

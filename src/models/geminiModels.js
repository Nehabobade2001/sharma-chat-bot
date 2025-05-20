const mongoose = require('mongoose');

const geminiResponseSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  response: { type: Object, required: true },
  modelVersion: { type: String, required: true },
  usageMetadata: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GeminiResponse', geminiResponseSchema);

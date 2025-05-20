const axios = require('axios');
const GeminiResponse = require('../models/geminiModels');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const mongoose = require('mongoose'); 


exports.generateContent = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json(errorResponse('Prompt is required'));
  }

  try {
    const result = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { data } = result;

    // Save to DB
    const newResponse = new GeminiResponse({
      prompt,
      response: data,
      modelVersion: data.modelVersion,
      usageMetadata: data.usageMetadata
    });

    await newResponse.save();

    res.status(200).json(successResponse(data, 'Content generated successfully'));
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    res.status(500).json(errorResponse('Failed to generate content', process.env.NODE_ENV === 'development' ? error.message : null));
  }
};



exports.getAllResponses = async (req, res) => {
  try {
    const responses = await GeminiResponse.find().sort({ createdAt: -1 });

    res.status(200).json(successResponse(responses, 'Fetched all Gemini responses successfully'));
  } catch (error) {
    console.error('Fetch Error:', error.message);
    res.status(500).json(errorResponse(
      'Failed to fetch Gemini responses',
      process.env.NODE_ENV === 'development' ? error.message : null
    ));
  }
};




exports.updateResponse = async (req, res) => {
  const { id } = req.params;
  const { prompt, response } = req.body;

  // 1. Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(errorResponse('Invalid response ID format.'));
  }

  // 2. Ensure at least one field to update
  if (!prompt && !response) {
    return res.status(400).json(errorResponse('Please provide prompt or response to update.'));
  }

  // 3. Build update object
  const updateFields = {};
  if (prompt) updateFields.prompt = prompt;
  if (response) updateFields.response = response;

  try {
    const updatedResponse = await GeminiResponse.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedResponse) {
      return res.status(404).json(errorResponse('Response not found.'));
    }

    return res.status(200).json(successResponse(updatedResponse, 'Response updated successfully.'));
  } catch (error) {
    console.error('Update Error:', error);
    return res.status(500).json(errorResponse(
      'Failed to update response.',
      process.env.NODE_ENV === 'development' ? error.message : undefined
    ));
  }
};


exports.deleteResponse = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format.'
    });
  }

  try {
    const deleted = await GeminiResponse.findByIdAndDelete(id);

    console.log(deleted,"delete");
    

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Response not found or already deleted.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Response deleted successfully.',
      data: deleted,
    });
  } catch (error) {
    console.error('Delete API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete response.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const express = require('express');
const router = express.Router();
const { generateContent, getAllResponses,  updateResponse, deleteResponse } = require('../controllers/geminiController');

router.post('/generate', generateContent);


router.get('/generate', getAllResponses);


router.put('/generate/:id', updateResponse);


router.delete('/generate/:id', deleteResponse);



module.exports = router;

const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Enhanced CORS configuration
app.use(cors());
app.use(express.json());

// Configure multer with error handling
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
}).single('document');

// Wrapper function for multer error handling
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('Unknown error:', err);
      return res.status(500).json({ error: 'Unknown upload error occurred' });
    }
    next();
  });
};

// Store document text in memory
let documentContent = '';

// Enhanced text extraction function
async function extractText(file) {
  const fileType = file.mimetype;
  let text = '';

  console.log('Extracting text from file type:', fileType);

  try {
    if (fileType === 'application/pdf') {
      const pdfData = await pdf(file.buffer);
      text = pdfData.text;
    } 
    else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      text = result.value;
    }
    else if (fileType === 'text/plain') {
      text = file.buffer.toString('utf-8');
    }
    else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    if (!text) {
      throw new Error('No text could be extracted from the document');
    }

    return text;
  } catch (error) {
    console.error('Error in extractText:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

// Route to handle document upload
app.post('/upload', uploadMiddleware, async (req, res) => {
  try {
    console.log('Upload request received');
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File received:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    documentContent = await extractText(req.file);
    console.log('Text extracted successfully, length:', documentContent.length);
    

    res.json({ 
      message: 'Document uploaded successfully',
      textLength: documentContent.length 
    });
  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to handle questions using AI21
app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'No question provided' });
    }

    if (!documentContent) {
      return res.status(400).json({ error: 'No document has been uploaded yet' });
    }

    // Use axios to call AI21 API
    const response = await axios.post(
      'https://api.ai21.com/studio/v1/answer', 
      {
        context: documentContent,
        question: question
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.AI21_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      answer: response.data.answer,
      answerInContext: response.data.answer_in_context
    });

  } catch (error) {
    console.error('Error in ask route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

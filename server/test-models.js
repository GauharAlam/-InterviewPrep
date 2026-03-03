require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // We can't actually call listModels easily without the REST API or using the SDK?
    // Let's try to just fetch the list using REST instead since listModels isn't purely in the simplest sdk.
  } catch (e) {
    console.error(e);
  }
}
listModels();

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}

async function sendEmailReply(emailId, generatedText, oAuth2Client) {
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: generatedText,
      threadId: emailId
    }
  });
}

module.exports = { run, sendEmailReply };
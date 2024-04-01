const express = require('express');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const run = require("./gemini")
const app = express();
const port = 3000;

// Replace with your downloaded credentials
const credentials = require('./credentials.json');

// Function to save tokens to a file
function saveTokensToFile(tokens) {
    fs.writeFileSync('tokens.json', JSON.stringify(tokens));
}

// Function to read tokens from a file
function readTokensFromFile() {
    try {
        const tokens = JSON.parse(fs.readFileSync('tokens.json'));
        return tokens;
    } catch (error) {
        console.error('Error reading tokens from file:', error);
        return null;
    }
}

// Initialize OAuth2 client
const oAuth2Client = new OAuth2Client(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirect_uris
);

// Read tokens from file on server startup
const tokensFromFile = readTokensFromFile();
if (tokensFromFile) {
    oAuth2Client.setCredentials(tokensFromFile);
    console.log('Tokens loaded from file:', tokensFromFile);
}

// Login route - redirects to Google login consent screen
// Login route - redirects to Google login consent screen
app.get('/login', (req, res) => {
  const loginUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline', // For refresh tokens
      scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'] // Requested scopes (profile, email, and Gmail readonly access)
  });
  res.redirect(loginUrl);
});

// Callback route - handles Google's redirect after user login
app.get('/auth/google/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('Missing authorization code');
    }

    try {
        const { tokens } = await oAuth2Client.getToken(code);
        // Save tokens to a file
        saveTokensToFile(tokens);
        console.log('Tokens saved:', tokens);
        res.send('Authentication successful!');
    } catch (error) {
        console.error('Error exchanging code for tokens:', error);
        res.status(500).send('Error exchanging code for tokens');
    }
});

app.get('/emails', async (req, res) => {
  try {
      const { emailId, subject } = req.query;

      if (!emailId && !subject) {
          return res.status(400).send('Missing emailId or subject parameter');
      }

      let prompt;
      if (emailId) {
          // Fetch email content using the emailId
          // Assume getEmailContentById is a function to fetch email content by ID
          const emailContent = await getEmailContentById(emailId);
          prompt = emailContent;
      } else {
          // Use the provided subject as the prompt
          prompt = subject;
      }

      // Generate content using the Google Generative AI run function
      const generatedText = await run(prompt);

      // Send the generated text as the response
      res.send(generatedText);

      // Send the generated text as a reply to the original email
      const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
      await gmail.users.messages.send({
          userId: 'me',
          requestBody: {
              raw: generatedText, // Assuming generatedText is in the format required for the Gmail API
              threadId: emailId // Use the threadId of the original email to send the reply in the same thread
          }
      });
  } catch (error) {
      console.error('Error generating content:', error);
      res.status(500).send('Error generating content');
  }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

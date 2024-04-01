const express = require("express");
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const {connection} = require("./connection")
const fs = require("fs");

const app = express();
const port = 3000;

// Replace with your downloaded credentials
const credentials = require("./credentials.json");
const { Run } = require("./gemini");

// Function to save tokens to a file
function saveTokensToFile(tokens) {
  fs.writeFileSync("tokens.json", JSON.stringify(tokens));
}

// Function to read tokens from a file
function readTokensFromFile() {
  try {
    const tokens = JSON.parse(fs.readFileSync("tokens.json"));
    return tokens;
  } catch (error) {
    console.error("Error reading tokens from file:", error);
    return null;
  }
}

// Initialize OAuth2 client
const oAuth2Client = new OAuth2Client(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[1]
);

// Read tokens from file on server startup
const tokensFromFile = readTokensFromFile();
if (tokensFromFile) {
  oAuth2Client.setCredentials(tokensFromFile);
  console.log("Tokens loaded from file:", tokensFromFile);
}

// Login route - redirects to Google login consent screen
// Login route - redirects to Google login consent screen
app.get("/login", (req, res) => {
  const loginUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline", // For refresh tokens
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.modify"
    ], // Requested scopes (profile, email, and Gmail readonly access)
  });
  res.redirect(loginUrl);
});

// Callback route - handles Google's redirect after user login
app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send("Missing authorization code");
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    // Save tokens to a file
    saveTokensToFile(tokens);
    console.log("Tokens saved:", tokens);
    res.send("Authentication successful!");
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    res.status(500).send("Error exchanging code for tokens");
  }
});

// Route to fetch emails
app.get("/emails", async (req, res) => {
  try {
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    // Fetch only the first unread email ID (using labels instead of search query)
    const listResponse = await gmail.users.messages.list({
      userId: "me",
      labelIds: ["UNREAD"],
      maxResults: 1, // Limit to 1 result
    });

    // console.log(listResponse)

    const emailIds = listResponse.data.messages?.map((message) => message.id);
    
    // Handle no unread emails case
    if (!emailIds || emailIds.length === 0) {
      return res.json({ message: "No unread emails found." });
    }

    const emailId = emailIds[0]; // Get the first (most recent) ID

    // Fetch full details for the single email
    const getResponse = await gmail.users.messages.get({
      userId: "me",
      id: emailId,
    });
    const response = await Run(`Generate appropriate response for the following email. Return only the body :${JSON.stringify(getResponse.data)}`);
    const resonse_label = await Run(`Choose an appropriate label only from this [Updates,Social,Forms,Promotions] for this email:${JSON.stringify(getResponse.data)}`);
    // const fullEmail = response;

    // const { emailId, replyText } = response;
    let senderEmail = getResponse.data.payload.headers.find(header => header.name === 'Return-Path').value;
    senderEmail = senderEmail.replace(/^<|>$/g, '')
    console.log(senderEmail)

    // // Construct the reply message
    const rawReply =
      `From: "Your Name" <your-email@gmail.com>\r\n` +
      `To: <${senderEmail}>\r\n` +
      `Subject: Re: Your Subject\r\n` +
      `In-Reply-To: ${emailId}\r\n` + // Ensure the reply is associated with the original email thread
      `Content-Type: text/plain; charset=utf-8\r\n\r\n` +
      `${response}`;

    // // Encode the reply message as base64
    const encodedReply = Buffer.from(rawReply)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // // Send the reply
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedReply,
      },
    });

    // await gmail.users.messages.modify({
    //   userId: "me",
    //   id: emailId,
    //   requestBody: {
    //     addLabelIds: [resonse_label], // Replace "REPLIED" with the label you want to add
    //   },
    // });

    // Mark the email as read
    await gmail.users.messages.modify({
      userId: "me",
      id: emailId,
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    });

    res.json({ message: "Reply sent successfully." });
    // res.send(getResponse); // Send only the single fullEmail object
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.listen(port, async() => {
  try{
    await connection;
    console.log(`Server listening on port ${port}`);
  }catch(err){
    console.log(err)
  }
});

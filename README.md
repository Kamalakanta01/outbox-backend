<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>

  <h1>Email Automation with AI</h1>

  <h2>Introduction</h2>

  <p>This project aims to automate email processing and replies using Google's Generative AI and Gmail APIs. By leveraging AI, the system can understand the context of received emails and assign automatic labels. It then generates appropriate replies based on the content of the emails.</p>

  <h2>Prerequisites</h2>

  <p>Before running the application, make sure you have the following:</p>
  <ul>
    <li>Node.js installed on your machine</li>
    <li>Google Cloud Platform project with the Gmail API enabled</li>
    <li>Google API credentials in JSON format</li>
    <li>A valid API key for Google's Generative AI</li>
  </ul>

  <h2>Installation</h2>

  <ol>
    <li>Clone the repository:</li>
    <code>git clone &lt;repository_url&gt;</code>
    <li>Install dependencies:</li>
    <code>npm install</code>
    <li>Set up environment variables:</li>
    <p>Create a <code>.env</code> file in the project root directory and add the following:</p>
    <pre><code>GEMINI_API_KEY=&lt;your_google_api_key&gt;</code></pre>
    <p>Replace <code>&lt;your_google_api_key&gt;</code> with your actual Google API key.</p>
  </ol>

  <h2>Usage</h2>

  <p>To start the server, run:</p>
  <code>npm start</code>

  <h3>Endpoints</h3>

  <ul>
    <li><code>/login</code>: Redirects to Google login consent screen for OAuth2 authentication.</li>
    <li><code>/auth/google/callback</code>: Handles Google's redirect after user login.</li>
    <li><code>/emails</code>: Fetches emails, processes them using AI, and sends automated replies.</li>
  </ul>

  <h2>Contributing</h2>

  <p>Contributions are welcome! Please read the <a href="CONTRIBUTING.md">contributing guidelines</a> before getting started.</p>

  <h2>License</h2>

  <p>This project is licensed under the <a href="LICENSE">MIT License</a>.</p>

</body>
</html>

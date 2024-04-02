const mongoose = require('mongoose');

// Define a schema for tokens
const tokenSchema = new mongoose.Schema({
  access_token: String,
  refresh_token: String,
  scope: String,
  token_type: String,
  id_token: String,
  expiry_date: Number
});

// Create a model based on the schema
const Token = mongoose.model('Token', tokenSchema);

module.exports = {Token}
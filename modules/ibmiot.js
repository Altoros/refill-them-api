/* global process */
var credentials = process.services['refill-them-api-iot'].credentials;

var Client = require('ibmiotf').IotfApplication;
var config = {
  'org': credentials.org,
  'id': process.env.APP_ID,
  'auth-key': credentials.apiKey,
  'auth-token': credentials.apiToken
};

var client = new Client(config);

module.exports = client;

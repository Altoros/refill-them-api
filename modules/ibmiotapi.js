/* global process */

var request = require('request');

var credentials = process.services['refill-them-api-iot'].credentials;
var apiEndpoint = credentials.http_host;

var api = {
  prefix: '/api/v0002',
  options: {
    baseUrl: 'https://' + apiEndpoint,
    auth: {
      username: credentials.apiKey,
      password: credentials.apiToken
    },
    headers: {
      'Content-Type': 'application/json'
    }
  },
  get: function (path, callback) {
    api.options.method = 'GET';
    api.options.uri = api.prefix + path;
    request(api.options, callback);
  },
  post: function (path, data, callback) {
    api.options.method = 'POST';
    api.options.uri = api.prefix + path;

    request(api.options, callback).form(JSON.stringify(data))
      .on('error', function (e) {
        console.log(e);
      });
  }
};

var data = {
  "id": "dispenser",
  "classId": "Device"
};

api.post('/device/types', data, function (error, res, body) {
  console.log(error);
  console.log(res.statusCode);
  console.log(body);
});

module.exports = api;

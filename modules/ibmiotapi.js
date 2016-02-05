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
    }
  },
  request: function (callback) {
    return request(api.options, callback)
      .on('error', function (e) {
        console.log(e);
      });
  },
  get: function (path, callback) {
    api.options.method = 'GET';
    api.options.uri = api.prefix + path;
    delete api.options.json;

    api.request(callback);
  },
  post: function (path, data, callback) {
    api.options.method = 'POST';
    api.options.uri = api.prefix + path;
    api.options.json = data;

    api.request(callback);
  },
  put: function (path, data, callback) {
    api.options.method = 'PUT';
    api.options.uri = api.prefix + path;
    api.options.json = data;

    api.request(callback);
  },
  delete: function (path, callback) {
    api.options.method = 'DELETE';
    api.options.uri = api.prefix + path;

    api.request(callback);
  }
};

module.exports = api;

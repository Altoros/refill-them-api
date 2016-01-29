var BlueprintClient = require('xively-blueprint-client-js');

var client = new BlueprintClient({
  authorization: 'Basic ' + process.env.BLUEPRINT_AUTHORIZATION
});

module.exports = client;

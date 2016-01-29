var BlueprintClient = require('xively-blueprint-client-js');

var client = new BlueprintClient({
  authorization: process.env.BLUEPRINT_AUTHORIZATION
});

console.log('Client initialized with authorization >', process.env.BLUEPRINT_AUTHORIZATION);

module.exports = client;

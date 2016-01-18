require('dotenv').load();
var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./routes');
var blueprint_client = require('./modules/blueprint');
var mqtt_client = require('./modules/mqtt');

var server = express();

server.use(bodyParser.json('application/json'));
server.use(routes.devices);

if (module.parent) {
  module.exports = server;
} else {
  blueprint_client.ready
    .then(function () {
      mqtt_client.startListener();
      server.listen(3000, function () {
        console.log('RefillThem API listening on http://localhost:3000');
      });
    });
}

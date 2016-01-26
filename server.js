/* global process */
require('dotenv').load();
var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./routes');
var blueprint_client = require('./modules/blueprint');
var mqtt_client = require('./modules/mqtt');
var cors = require('cors');

var server = express();

server.use(bodyParser.json('application/json'));
server.use(cors());
server.use(routes.devices);

server.get('/', function (req, res) {
  res
    .status(200)
    .send('Refill Them API running');
});

if (module.parent) {
  module.exports = server;
} else {
  blueprint_client.ready
    .then(function () {
      mqtt_client.startListener();
      var port = process.env.PORT || 5000;
      server.listen(port, function () {
        console.log('RefillThem API listening on http://localhost:' + port);
      });
    });
}

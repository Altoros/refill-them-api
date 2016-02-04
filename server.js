/* global process */
require('dotenv').load();
require('./modules/services').load();
var express = require('express');
var bodyParser = require('body-parser');
// var routes = require('./routes');
// var mqtt_client = require('./modules/mqtt');
var cors = require('cors');
var api = require('./modules/ibmiotapi');

var server = express();

server.use(bodyParser.json('application/json'));
server.use(cors());
// server.use(routes.devices);

server.get('/', function (req, res) {
  res
    .status(200)
    .send('Refill Them API running');
});

if (module.parent) {
  module.exports = server;
} else {
  // mqtt_client.startListener();
  var port = process.env.PORT || 5000;
  server.listen(port, function () {
    console.log('RefillThem API listening on http://localhost:' + port);
  });
}

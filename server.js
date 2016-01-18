require('dotenv').load();
var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./routes');
var client = require('./modules/blueprint');

var server = express();

server.use(bodyParser.json('application/json'));
server.use(routes.devices);

if (module.parent) {
  module.exports = server;
} else {
  client.ready
    .then(function () {
      server.listen(3000, function () {
        console.log('RefillThem API listening on http://localhost:3000');
      });
    });
}

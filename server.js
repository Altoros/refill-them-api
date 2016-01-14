var express = require('express');
var bodyParser = require('body-parser');

var server = express();

server.use(bodyParser.json('application/json'));

if(module.parent) {
  module.exports = server;
} else {
  server.listen(3000, function () {
    console.log('RefillThem API listening on http://localhost:3000');
  });
}
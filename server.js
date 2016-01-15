require('dotenv').load();
var express = require('express');
var bodyParser = require('body-parser');
var randomString = require('random-string');
var BlueprintClient = require('xively-blueprint-client-js');

var client = new BlueprintClient({
  authorization: process.env.BLUEPRINT_AUTHORIZATION
});

var server = express();

server.use(bodyParser.json('application/json'));

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

server.post('/devices', function (req, res) {
  // Generate association code
  var associationCode = randomString({
    length: 8,
    numeric: true,
    letters: true,
    special: false
  }).toUpperCase();

  // Create device on Blueprint
  client.apis.devices.create({
    accountId: process.env.BLUEPRINT_ACCOUNT_ID,
    deviceTemplateId: process.env.BLUEPRINT_DEVICE_TEMPLATE_ID,
    organizationId: process.env.BLUEPRINT_ORGANIZATION_ID,
    serialNumber: req.body.serial,
    associationCode: associationCode
  })
    .then(function (response) {
      var device = response.obj.device;

      // Get MQTT credentials for the device
      client.apis.accessMqttCredentials.create({
        accountId: process.env.BLUEPRINT_ACCOUNT_ID,
        entityId: device.id,
        entityType: 'device'
      })
        .then(function (response) {
          var credential = response.obj.mqttCredential;

          // Get device after get credentials
          client.apis.devices.byId({
            id: device.id
          })
            .then(function (response) {
              device = response.obj.device;

              // Set password to device
              client.apis.devices.update({
                id: device.id,
                etag: device.version,
                password: credential.secret
              })
                .then(function (response) {
                  device = response.obj.device;
                  console.log(device);
                  res
                    .status(201)
                    .send({ device: device });
                })
                .catch(function (response) {
                  onBlueprintError(response, res);
                });
            })
            .catch(function (response) {
              onBlueprintError(response, res);
            });
        })
        .catch(function (response) {
          // Delete device
          client.apis.devices.delete({
            id: device.id,
            etag: device.version
          })
            .then(function (response) {
              res
                .status(409)
                .send('An error has occurred trying to get the credentials for the device');
            })
            .catch(function (response) {
              onBlueprintError(response, res);
            });
        });
    })
    .catch(function (response) {
      onBlueprintError(response, res);
    });
});

// Utils functions
function onBlueprintError (response, res) {
  console.log('Error!!!');
  var errorMessage = '';
  if (response.obj.error) {
    console.log(response.obj.error.details);
    errorMessage = response.obj.error.message;
  } else if (response.obj.length) {
    console.log(response.obj);
    errorMessage = response.obj[0].message;
  }

  res
    .status(response.status)
    .send(errorMessage);
}

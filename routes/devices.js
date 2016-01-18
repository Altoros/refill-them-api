var express = require('express');
var q = require('q');
var randomString = require('random-string');

var BlueprintClient = require('xively-blueprint-client-js');

var client = new BlueprintClient({
  authorization: process.env.BLUEPRINT_AUTHORIZATION
});

var routes = express.Router();

routes
  .post('/devices', function (req, res) {
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

            client.apis.devices.byId({
              id: device.id
            })
              .then(function (response) {
                device = response.obj.device;

                // Get device after get credentials
                updateDevice(device, {password: credential.secret})
                  .then(function (device) {
                    res
                      .status(201)
                      .send({device: device});
                  }, function (err) {
                    onBlueprintError(err, res);
                  });
              }, function (err) {
                onBlueprintError(err, res);
              });
          }, function (response) {
            // Delete device
            client.apis.devices.delete({
              id: device.id,
              etag: device.version
            })
              .then(function (response) {
                res
                  .status(409)
                  .send('An error has occurred trying to get the credentials for the device');
              }, function (response) {
                onBlueprintError(response, res);
              });
          });
      }, function (response) {
        onBlueprintError(response, res);
      });
  })
  .put('/devices/:id/associate', function (req, res) {
    var deviceId = req.params.id;

    client.apis.devices.byId({
      id: deviceId
    })
      .then(function (response) {
        var device = response.obj.device;
        var data = req.body.device;

        if (device.associationCode === data.associationCode) {
          updateDevice(device, data)
            .then(function (device) {
              res
                .status(200)
                .send({device: device});
            }, function (response) {
              onBlueprintError(response, res);
            });
        } else {
          res
            .status(403)
            .send({msg: 'Wrong association code'});
        }
      }, function (response) {
        onBlueprintError(response, res);
      });
  })
  .put('/devices/:id/disassociate', function (req, res) {
    var deviceId = req.params.id;

    client.apis.devices.byId({
      id: deviceId
    })
      .then(function (response) {
        var device = response.obj.device;

        updateDevice(device, {provisioningState: 'deactivated'})
          .then(function (device) {
            res
              .status(200)
              .send({device: device});
          }, function (response) {
            onBlueprintError(response, res);
          });
      }, function (response) {
        onBlueprintError(response, res);
      });
  });

function updateDevice (device, data) {
  var deferred = q.defer();

  data.id = device.id;
  data.etag = device.version;

  // Update device
  client.apis.devices.update(data)
    .then(function (response) {
      device = response.obj.device;
      deferred.resolve(device);
    }, deferred.reject);

  return deferred.promise;
}

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

module.exports = routes;

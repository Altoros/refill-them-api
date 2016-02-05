var express = require('express');
var randomString = require('random-string');
var api = require('../modules/ibmiotapi');

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

    var data = {
      deviceId: req.body.serial,
      deviceInfo: {
        serialNumber: req.body.serial
      },
      metadata: {
        associationCode: associationCode,
        consumedShots: 0
      }
    };

    // Create device on Bluemix
    api.post('/device/types/dispenser/devices', data, function (error, response, body) {
      console.log('Error:', error);
      console.log('Status Code:', res.statusCode);
      console.log('Body:', body);

      if (error || response.statusCode !== 201) {
        res
          .status(response.statusCode)
          .send(body);
      } else {
        var device = body;

        // Subscribe to device channels
        // mqtt_client.listenDevice(device);
        res
          .status(201)
          .send({device: device});
      }
    });
  })
  .put('/devices/:id/associate', function (req, res) {
    var deviceId = req.params.id;

    console.log('GET /device/types/dispenser/devices/' + deviceId);

    api.get('/device/types/dispenser/devices/' + deviceId, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        api.delete('/device/types/dispenser/devices' + deviceId, function (error, response, body) {
          res
            .status(response.statusCode)
            .send('Server could not verify association code and Device was deleted.');
        });
      } else {
        var device = JSON.parse(body);

        if (req.body.device.associationCode === device.metadata.associationCode) {
          delete req.body.device.associationCode;

          var data = {
            metadata: device.metadata
          };

          for (var index in req.body.device) {
            data.metadata[index] = req.body.device[index];
          }

          api.put('/device/types/dispenser/devices/' + deviceId, data, function (error, response, body) {
            console.log(error);
            console.log(response.statusCode);
            console.log(body);

            if (error || response.statusCode !== 200) {
              api.delete('/device/types/dispenser/devices' + deviceId, function (error, response, body) {
                res
                  .status(response.statusCode)
                  .send('Device deleted.');
              });
            } else {
              var device = body;

              res
                .status(200)
                .send({device: device});
            }
          });
        } else {
           api.delete('/device/types/dispenser/devices' + deviceId, function (error, response, body) {
              res
                .status(response.statusCode)
                .send('Association Code does not match and Device was deleted.');
            });
        }
      }
    });
  });
//   .put('/devices/:id/disassociate', function (req, res) {
//     var deviceId = req.params.id;

//     blueprint_client.apis.devices.byId({
//       id: deviceId
//     })
//       .then(function (response) {
//         var device = response.obj.device;

//         updateDevice(device, {provisioningState: 'deactivated'})
//           .then(function (device) {
//             res
//               .status(200)
//               .send({device: device});
//           }, function (response) {
//             onBlueprintError(response, res);
//           });
//       }, function (response) {
//         onBlueprintError(response, res);
//       });
//   });

var deleteDevice = function (res, deviceId, errorMsg) {
  api.delete('/device/types/dispenser/devices' + deviceId, function (error, response, body) {
    res
      .status(response.statusCode)
      .send(errorMsg);
  });
}

module.exports = routes;

/* global before describe it request expect blueprint_client */
var randomString = require('random-string');

before(function (done) {
  blueprint_client.ready
    .then(function () {
      mqtt_client.startListener();
      console.log('Blueprint Client ready');
      done();
    });
});

describe('Devices', function () {
  var deviceId;
  var associationCode;

  it('should save a new device and return an association code', function () {
    var serialNumber = randomString({
      length: 8,
      numeric: true,
      letters: true,
      special: false
    }).toUpperCase();

    return request
      .post('/devices')
      .send({
        serial: serialNumber
      })
      .expect(201)
      .then(function (res) {
        var body = res.body;

        expect(body).to.have.property('device');

        var device = res.body.device;

        expect(device).to.have.property('id');
        expect(device).to.have.property('associationCode');
        expect(device).to.have.property('serialNumber', serialNumber);
        expect(device).to.have.property('provisioningState', 'activated');
        expect(device).to.have.property('password');
        expect(device).to.have.property('consumedShots');

        //Verifying channels creation
        expect(device.channels).to.have.length(1);

        var status_report = device.channels[0];
        expect(status_report).to.have.property('channelTemplateName', 'STATUS_REPORT');

        deviceId = device.id;
        associationCode = device.associationCode;
      });

  // TODO
  // Remove device
  });

  it('should associate the device', function () {
    var data = {
      device: {
        associationCode: associationCode,
        name: 'Device Name',
        totalShots: 100,
        notifyRefillAt: 20,
        email: 'user@domain.com'
      }
    };

    return request
      .put('/devices/' + deviceId + '/associate')
      .send(data)
      .expect(200)
      .then(function (res) {
        var body = res.body;

        expect(body).to.have.property('device');

        var device = res.body.device;

        expect(device).to.have.property('id', deviceId);
        expect(device).to.have.property('name', device.name);
        expect(device).to.have.property('totalShots', device.totalShots);
        expect(device).to.have.property('notifyRefillAt', device.notifyRefillAt);
        expect(device).to.have.property('email', device.email);
        expect(device).to.have.property('provisioningState', 'activated');
      });
  });

  it('should disassociate the device', function () {
    return request
      .put('/devices/' + deviceId + '/disassociate')
      .expect(200)
      .then(function (res) {
        var body = res.body;

        expect(body).to.have.property('device');

        var device = res.body.device;

        expect(device).to.have.property('id', deviceId);
        expect(device).to.have.property('provisioningState');
      });
  });
});

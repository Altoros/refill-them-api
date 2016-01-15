var BlueprintClient = require('xively-blueprint-client-js');
var client = new BlueprintClient({
  authorization: process.env.BLUEPRINT_AUTHORIZATION,
});
var randomString = require('random-string');

before(function (done) {
  client.ready
    .then(function() {
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
      .send({serial: serialNumber})
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

        deviceId = device.id;
        associationCode = device.associationCode;
      });

    //TODO
    //Remove device
  });

  it('should associate the device', function () {
    var data = {
      device: {
        associationCode: associationCode,
        name: "Device Name",
        total_shots: 100,
        notify_refill_at: 20,
        email: "user@domain.com"
      },
    };

    return request
      .put('devices/' + deviceId + '/associate')
      .send(data)
      .expect(200)
      .then(function (res) {
        var body = res.body;

        expect(body).to.have.property('device');

        var device = res.body.device;

        expect(device).to.have.property('id', deviceId);
        expect(device).to.have.property('name', device.name);
        expect(device).to.have.property('total_shots', device.total_shots);
        expect(device).to.have.property('notify_refill_at', device.notify_refill_at);
        expect(device).to.have.property('email', device.email);
        expect(device).to.have.property('status', 'ASSOCIATED');
      });
  });

  it('should disassociate the device', function () {
    return request
      .put('devices/' + deviceId + '/disassociate')
      .expect(200)
      .then(function (res) {
        var body = res.body;

        expect(body).to.have.property('device');

        var device = res.body.device;

        expect(device).to.have.property('id', deviceId);
        expect(device).to.have.property('status', 'DISASSOCIATED');
      });
  });
});
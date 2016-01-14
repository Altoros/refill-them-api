describe('Devices', function () {
  var deviceId;
  var associationCode;

  it('should save a new device and return an association code', function () {
    var data = {
      serial: 'DEVICESERIAL'
    };

    return request
      .post('/devices')
      .send(data)
      .expect(201)
      .then(function (res) {
        var body = res.body;

        expect(body).to.have.property('device');

        var device = res.body.device;

        expect(device).to.have.property('id');
        expect(device).to.have.property('associationCode');
        expect(device).to.have.property('serial', data.serial);
        expect(device).to.have.property('status', 'READY');

        deviceId = device.id;
        associationCode = device.associationCode;

        var credentials = res.body.credentials;

        expect(credentials).to.have.property('secret');

      });
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
var mqtt = require('mqtt');
var blueprint_client = require('./blueprint');
var emailNotifications = require('./email-notifications');

var mqtt_client = {};

mqtt_client.startListener = function () {
  var options = {
    keepalive: parseInt(process.env.MQTT_KEEPALIVE, 10),
    clientId: process.env.MQTT_USERNAME,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
  };
  mqtt_client.instance = mqtt.connect(process.env.MQTT_HOST, options);

  console.log('MQTT StartListener');
  mqtt_client.instance
    .on('connect', function () {
      console.log('MQTT connected');
      subscribeDevices();
    }, function (err) {
      console.log('Error on connect: ', err);
    })
    .on('message', function (topic, message) {
      message = message.toString();

      console.log('Message arrived on: ', topic);
      console.log(message);

      var deviceId = topic.split('/')[5];
      updateDevice(deviceId, message);
    })
    .on('error', function (data) {
      console.log('MQTT error: ', data);
    })
    .on('close', function (data) {
      console.log('MQTT connection close', data);
    });
};

mqtt_client.listenDevice = function (device) {
  var channels = device.channels.map(function (topic) {
    return topic.channel;
  });

  mqtt_client.instance.subscribe(channels, {qos: 0}, function (err) {
    if (err) {
      console.log('Error subscribing to channels of Device with ID ' + device.id + ': ', err);
    } else {
      console.log('Subscription to device with ID ' + device.id + ': completed');
    }
  });
};

var subscribeDevices = function () {
  blueprint_client.apis.devices.all({
    'accountId': process.env.BLUEPRINT_ACCOUNT_ID,
    'results': false
  }).then(function (response) {
    var pageSize = response.obj.devices.meta.count;

    blueprint_client.apis.devices.all({
      'accountId': process.env.BLUEPRINT_ACCOUNT_ID,
      'pageSize': pageSize
    }).then(function (res) {
      var devices = res.obj.devices.results;
      var channels = [];

      devices.forEach(function (device) {
        device.channels.forEach(function (topic) {
          if (topic.channelTemplateName === 'STATUS_REPORT') {
            channels.push(topic.channel);
          }
        });
      });

      mqtt_client.instance.subscribe(channels, {qos: 0}, function (err) {
        if (err) {
          console.log('Error on subscribe: ', err);
        } else {
          console.log('Subscription completed! (%s channels)', channels.length);
        }
      });
    }).catch(function (res) {
      console.log('Error!!!');
      console.error(res);
    });
  }).catch(function (res) {
    console.log('Error!!!');
    console.error(res);
  });
};

var updateDevice = function (deviceId, message) {
  blueprint_client.apis.devices.byId({
    id: deviceId
  }).then(function (response) {
    var device = response.obj.device;

    var data = {
      id: deviceId,
      etag: device.version
    };

    if (message === 'consume_shot') {
      data.consumedShots = ++device.consumedShots;

      var shotsLeft = device.totalShots - data.consumedShots;

      //Checks equality to avoid multiple notifications
      if (shotsLeft === device.notifyRefillAt) {
        emailNotifications.notifyRefill(device, shotsLeft);
      }
    } else if (message === 'refill') {
      data.consumedShots = 0;
    }
    blueprint_client.apis.devices.update(data)
      .then(function (response) {
        console.log('Response after update', response.obj);
      });
  });
};

module.exports = mqtt_client;

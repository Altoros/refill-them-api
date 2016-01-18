var mqtt = require('mqtt');
var blueprint_client = require('./blueprint');

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
      console.log('Error subscribing to channels of Device with ID ' +  device.id + ': ', err);
    } else {
      console.log('Subscription to device with ID '+ device.id + ': completed');
    }
  });
};

var subscribeDevices = function () {
  blueprint_client.apis.devices.all({
    'accountId': process.env.BLUEPRINT_ACCOUNT_ID
  }).then(function (res) {
    var devices = res.obj.devices.results;
    var channels = [];

    devices.forEach(function (device) {
      device.channels.forEach(function (topic) {
        channels.push(topic.channel);
      });
    });

    mqtt_client.instance.subscribe(channels, {qos: 0}, function (err) {
      if (err) {
        console.log('Error on subscribe: ', err);
      } else {
        console.log('Subscription completed!');
      }
    });
  })
    .catch(function (res) {
      console.log('Error!!!');
      console.error(res);
    });
};

module.exports = mqtt_client;

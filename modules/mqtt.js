/* global process */
var mqtt = require('mqtt');
var kue = require('kue');
var blueprint_client = require('./blueprint');
var emailNotifications = require('./email-notifications');

var queue = kue.createQueue({
  redis: process.env.REDIS_URL
});

queue.process('update_device', function (job, done) {
  updateDevice(job.data.deviceId, job.data.messageType, done);
});

queue.process('send_status', function (job, done) {
  sendStatus(job.data.deviceId, job.data.topic, done);
});

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
    .on('message', processMessage)
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
    accountId: process.env.BLUEPRINT_ACCOUNT_ID,
    organizationId: process.env.BLUEPRINT_ORGANIZATION_ID,
    results: false
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

var processMessage = function (topic, message) {
  try {
    message = JSON.parse(message);
  } catch (e) {
    message = {
      type: 'unknown',
      message: 'Message is not a valid JSON'
    };
  }

  console.log('Message arrived on: ', topic);
  console.log(message);

  var deviceId = topic.split('/')[5];
  var job = {
    data: {
      deviceId: deviceId
    }
  };

  switch (message.type) {
    case 'consume_shot':
    case 'refill':
      job.name = 'update_device';
      job.data.messageType = message.type;
      break;
    case 'get_status':
      job.name = 'send_status';
      job.data.topic = topic;
      break;
  }

  if (job.name) {
    queue.create(job.name, job.data)
      .removeOnComplete(true)
      .ttl(10000)
      .attempts(3)
      .save(function (err) {
        if (err) {
          console.log('Error creating job: ', err);
        } else {
          console.log('Job ' + job.name + ' created');
        }
      })
      .on('complete', function (result) {
        console.log('Job Completed. Result: ' + result);
      })
      .on('failed', function (errorMessage) {
        console.log('Job failed: ', errorMessage);
      });
  }
};

var updateDevice = function (deviceId, messageType, done) {
  blueprint_client.apis.devices.byId({
    id: deviceId
  }).then(function (response) {
    var device = response.obj.device;
    var data = {
      id: deviceId,
      etag: device.version
    };

    if (messageType === 'consume_shot') {
      data.consumedShots = ++device.consumedShots;

      var shotsLeft = device.totalShots - data.consumedShots;

      // Checks equality to avoid multiple notifications
      if (shotsLeft === device.notifyRefillAt) {
        emailNotifications.notifyRefill(device, shotsLeft);
      }
    } else if (messageType === 'refill') {
      data.consumedShots = 0;
    }

    blueprint_client.apis.devices.update(data)
      .then(function (response) {
        done(); // success
        console.log('Device updated');
      }, onBlueprintError);
  }, onBlueprintError);

  function onBlueprintError (err) {
    done(new Error(err));
  }
};

var sendStatus = function (deviceId, topic, done) {
  blueprint_client.apis.devices.byId({
    id: deviceId
  }).then(function (response) {
    var device = response.obj.device;
    var message = {
      type: 'send_status',
      data: device
    };

    mqtt_client.instance.publish(topic, JSON.stringify(message));
    done();
  }, function (err) {
    done(new Error(err));
  });
};

module.exports = mqtt_client;

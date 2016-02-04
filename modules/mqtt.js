/* global process */
var kue = require('kue');
var client = require('./ibmiot');
// var emailNotifications = require('./email-notifications');

var queue = kue.createQueue({
  redis: process.env.REDIS_URL
});

queue.process('update_device', function (job, done) {
  // updateDevice(job.data.deviceId, job.data.messageType, done);
});

queue.process('send_status', function (job, done) {
  // sendStatus(job.data.deviceId, job.data.topic, done);
});

var mqtt_client = {};

mqtt_client.startListener = function () {
  mqtt_client.instance = client;
  mqtt_client.instance.connect();

  console.log('MQTT StartListener');
  mqtt_client.instance
    .on('connect', function () {
      console.log('MQTT connected');
      mqtt_client.instance.subscribeToDeviceEvents();
      mqtt_client.instance.subscribeToDeviceStatus();
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

mqtt_client.stopListener = function () {
  mqtt_client.instance.end(false, function () {
    console.log('MQTT Listener is closed');
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

// var updateDevice = function (deviceId, messageType, done) {
//   blueprint_client.apis.devices.byId({
//     id: deviceId
//   }).then(function (response) {
//     var device = response.obj.device;
//     var data = {
//       id: deviceId,
//       etag: device.version
//     };

//     if (messageType === 'consume_shot') {
//       data.consumedShots = ++device.consumedShots;

//       var shotsLeft = device.totalShots - data.consumedShots;

//       // Checks equality to avoid multiple notifications
//       if (shotsLeft === device.notifyRefillAt) {
//         emailNotifications.notifyRefill(device, shotsLeft);
//       }
//     } else if (messageType === 'refill') {
//       data.consumedShots = 0;
//     }

//     blueprint_client.apis.devices.update(data)
//       .then(function (response) {
//         done(); // success
//         console.log('Device updated');
//       }, onBlueprintError);
//   }, onBlueprintError);

//   function onBlueprintError (err) {
//     done(new Error(err));
//   }
// };

// var sendStatus = function (deviceId, topic, done) {
//   blueprint_client.apis.devices.byId({
//     id: deviceId
//   }).then(function (response) {
//     var device = response.obj.device;
//     var message = {
//       type: 'send_status',
//       data: device
//     };

//     mqtt_client.instance.publish(topic, JSON.stringify(message));
//     done();
//   }, function (err) {
//     done(new Error(err));
//   });
// };

module.exports = mqtt_client;

var sendgrid  = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);

var emailNotifications = {
  notifyRefill: function (device, shotsLeft) {
    sendgrid.send({
      to:       device.email,
      from:     process.env.FROM_EMAIL,
      fromname: process.env.FROM_NAME,
      subject:  'Refill your Device: ' + device.name,
      text:     'Your device only has ' + shotsLeft + ' shots, it should be refilled soon.'
    }, function(err, json) {
      if (err) {
        return console.error('Error trying to send an email to ' + device.email + ':',err);
      } else {
        console.log('Notification sent to: ', device.email);
      }
    });
  }
}

module.exports = emailNotifications;

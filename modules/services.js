/* global process */
var services = {
  load: function () {
    var services = JSON.parse(process.env.VCAP_SERVICES);
    process.services = {};
    for (var service in services) {
      services[service].forEach(function (instance) {
        process.services[instance.name] = instance;
        delete instance.name;
      });
    }
  }
};

module.exports = services;

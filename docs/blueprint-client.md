#Useful pieces of code that use blueprint-client

##LIST customFields
```js
client.apis.devicesCustomFields.all({
  "accountId": process.env.BLUEPRINT_ACCOUNT_ID,
  "deviceTemplateId": process.env.BLUEPRINT_DEVICE_TEMPLATE_ID
})
  .then(function (res) {
    res.obj.deviceFields.results.forEach(function (customField) {
      console.log(customField.id, customField.version, customField.name);
    });
  })
  .catch(function(res) {
    console.log('Error!!!');
    console.error(res.obj.error.details);
  });
```

##Create Custom fields
```js
client.apis.devicesCustomFields.create({
  "accountId": process.env.BLUEPRINT_ACCOUNT_ID,
  "deviceTemplateId": process.env.BLUEPRINT_DEVICE_TEMPLATE_ID,
  "name": "password",
  "fieldType": "string",
  "description": "MQTT password",
  "required": "false",
  "default": null
})
  .then(function (res) {
    console.log(res);
  })
  .catch(function(res) {
    console.log('Error!!!');
    console.error(res.obj.error.details);
  });
```

##Create Organization
```js
client.apis.organizations.create({
  "accountId":  process.env.BLUEPRINT_ACCOUNT_ID,
  "name": "Default Organization (RefillThem)"
}).then(function (res) {
    console.log(res);
  })
  .catch(function(res) {
    console.log('Error!!!');
    console.error(res);
  });
```

##Get all the devices
```js
client.apis.devices.all({
  "accountId":  process.env.BLUEPRINT_ACCOUNT_ID
}).then(function (res) {
    console.log(res.obj.devices);
  })
  .catch(function(res) {
    console.log('Error!!!');
    console.error(res);
  });
```
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

##Get all the channel templates
```js
blueprint_client.apis.channelsTemplates.all({
  'accountId': process.env.BLUEPRINT_ACCOUNT_ID
}).then(function (res) {
  console.log(res.obj.channelTemplates.results);
});
```

##Create channel template
```js
blueprint_client.apis.channelsTemplates.create({
  accountId: process.env.BLUEPRINT_ACCOUNT_ID,
  entityId: process.env.BLUEPRINT_DEVICE_TEMPLATE_ID,
  entityType: 'deviceTemplate',
  name: 'STATUS_REPORT',
  flags: { deviceUpdatable: true, timeSeries: false },
  persistenceType: 'simple'
}).then(function (res) {
  console.log(res);
});
```

##Delete channel template
```js
blueprint_client.apis.channelsTemplates.delete({
  id: 'b6b17b29-914b-4f66-a40d-6b4f595dd2a9',
  etag: 'Z1'
}).then(function (res) {
  console.log(res);
}, function (err) {
  console.log('Error on delete', err);
});
```


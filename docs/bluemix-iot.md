#Useful pieces of code that we used on Bluemix IoT Foundation

### API Docs
https://docs.internetofthings.ibmcloud.com/swagger/v0002.html

##Device Type (dispenser)
####POST /device/types
```json
{
  'id': 'dispenser',
  'classId': 'Device',
  'deviceInfo': {
    'serialNumber': ''
  },
  'metadata': {
    'notifyRefillAt': 0,
    'consumedShots': 0,
    'totalShots': 0,
    'email': '',
    'name': '',
    'associationCode': ''
  }
}
```

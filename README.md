# RefillThem API

[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard) [![Code Climate](https://codeclimate.com/github/Altoros/refill-them-api/badges/gpa.svg)](https://codeclimate.com/github/Altoros/refill-them-api) [![Build Status](https://travis-ci.org/Altoros/refill-them-api.svg?branch=master)](https://travis-ci.org/Altoros/refill-them-api)
[![Test Coverage](https://codeclimate.com/github/Altoros/refill-them-api/badges/coverage.svg)](https://codeclimate.com/github/Altoros/refill-them-api/coverage)

This is an API developed to be used by [RefillThem](https://github.com/Altoros/refill-them) (mobile application) and Dispensers with IoT capabilities. It implements blueprint-client, a node module developed by Xively.

## Installation

### Local Installation

Clone this repository and run the following from the command line:

```sh
npm install
```

## Run the API (server) locally

```sh
npm start
```

## Tests

The API is being developed using TDD. Implemented with Mocha (assisted by Chai).

To run the tests:
```sh
npm test
```

## Technology Stack

- NodeJS (with Express)

## ENV Vars
- BLUEPRINT_ACCOUNT_ID
- BLUEPRINT_AUTHORIZATION
- BLUEPRINT_DEVICE_TEMPLATE_ID
- BLUEPRINT_ORGANIZATION_ID
- MQTT_HOST
- MQTT_KEEPALIVE
- MQTT_PASSWORD
- MQTT_USERNAME
- SENDGRID_PASSWORD
- SENDGRID_USERNAME
- FROM_EMAIL
- FROM_NAME
- REDIS_URL
- GITHUB_OAUTH_TOKEN (to install blueprint-client dependency)

var chai = require('chai');
var supertest = require('supertest-as-promised');
var api = require('../../server');
var request = supertest(api);
var blueprint_client = require('../../modules/blueprint');
var mqtt_client = require('../../modules/mqtt');

GLOBAL.AssertionError = chai.AssertionError;
GLOBAL.expect = chai.expect;
GLOBAL.request = request;
GLOBAL.blueprint_client = blueprint_client;
GLOBAL.mqtt_client = mqtt_client;

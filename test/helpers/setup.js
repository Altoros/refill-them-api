var chai = require('chai');
var supertest = require('supertest-as-promised');
var api = require('../../server');
var request = supertest(api);
var blueprint_client = require('../../modules/blueprint');

GLOBAL.AssertionError = chai.AssertionError;
GLOBAL.expect = chai.expect;
GLOBAL.request = request;
GLOBAL.blueprint_client = blueprint_client;

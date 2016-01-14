var chai = require('chai');
var supertest = require('supertest-as-promised');
var api = require('../../server.js');
var request = supertest(api);

GLOBAL.AssertionError = chai.AssertionError;
GLOBAL.expect = chai.expect;
GLOBAL.request = request;
'use strict';

var test          = require('tap').test;
var mikealRequest = require('request');
var nock          = require('../');

nock.enableNetConnect();

// Do not copy tests that rely on the process.env.AIRPLANE, we are deprecating that via #1231
test('allowUnmocked for https', {skip: process.env.AIRPLANE}, function(t) {
  nock('https://www.google.com/', {allowUnmocked: true})
  .get('/pathneverhit')
  .reply(200, {foo: 'bar'});

  var options = {
    method: 'GET',
    uri: 'https://www.google.com/'
  };

  mikealRequest(options, function(err, resp, body) {
    t.notOk(err, 'should be no error');
    t.true(typeof body !== 'undefined', 'body should not be undefined');
    t.true(body.length !== 0, 'body should not be empty');
    t.end();
  });
});

// Do not copy tests that rely on the process.env.AIRPLANE, we are deprecating that via #1231
test('allowUnmocked for https with query test miss', {skip: process.env.AIRPLANE}, function(t) {
  nock.cleanAll();
  nock('https://www.google.com', {allowUnmocked: true})
    .get('/search')
    .query(function() {return false;})
    .reply(500);

  var options = {
    method: 'GET',
    uri: 'https://www.google.com/search'
  };

  mikealRequest(options, function(err, resp, body) {
    t.notOk(err, 'should be no error');
    t.true(typeof body !== 'undefined', 'body should not be undefined');
    t.true(body.length !== 0, 'body should not be empty');
    t.end();
  });
});

test('allowUnmocked for https with body', {skip: process.env.AIRPLANE}, function(t) {
  nock.cleanAll();

  const reqbody = { 'name': 'test user',
                 'email': 'testuser@wework.com',
                 'date_of_birth': '1992-10-09',
                 'phone': '1234567890',
                 'gender': 'male' }
  const json = { 'result': {
                  'user': {
                    'id': 9999999,
                    'email': 'testuser@wework.com',
                    'uuid': '0ed9bd90-ae24-0136-d7e3-0242ac1119xx',
                    'name': 'test user',
                    'status': 'active',
                    'phone': '123-456-7890',
                    'kind': 'member',
                    'date_of_birth': '1992-10-10T00:00:00.000Z',
                    'gender': 'male',
                    'location_uuid': null
                  }
                }
              }
  nock('https://id-staging.wework.com', { allowUnmocked: true })
    .persist()
    .post('/api/v2/users/', reqbody)
    .reply(201, JSON.stringify(json));
  // nock('https://id-staging.wework.coma', { allowUnmocked: true })
  //   .persist()
  //   .post('/api/v2/usersNOT/', { a1: "b1" })
  //   .reply(201, JSON.stringify({ a: "b" }));

  var options1 = {
    method: 'POST',
    uri: 'https://id-staging.wework.com/api/v2/users/',
    json: reqbody,
    headers: { 'authorization': 'Token token=8afcf1dd867581a02a60c6847ff02ff0' }
  };
  var options2 = {
    method: 'POST',
    uri: 'https://id-staging.wework.com/api/v2/users/',
    json: { "name": "Star Farer6",
            "email": "star.farer6@we.co",
            "date_of_birth": "1951-11-28",
            "phone": "662-802-2151",
            "gender": "Other" },
    headers: { 'authorization': 'Token token=8afcf1dd867581a02a60c6847ff02ff0' }
  };

  mikealRequest(options1, function(err, resp, body) {
    t.notOk(err, 'should be no error');
    t.true(typeof body !== 'undefined', 'body should not be undefined');
    t.true(body.length !== 0, 'body should not be empty');
  });
  mikealRequest(options2, function(err, resp, body) {
    t.notOk(err, 'should be no error');
    t.true(typeof body !== 'undefined', 'body should not be undefined');
    t.true(body.length !== 0, 'body should not be empty');
    t.end();
  });
});

test('GET', {skip: process.env.AIRPLANE}, function(t) {
  nock.cleanAll();

  nock('https://jsonplaceholder.typicode.com', { allowUnmocked: true })
    .persist()
    .get('/todos/1')
    .reply(201, JSON.stringify({}));

  var options1 = {
    method: 'GET',
    uri: 'https://jsonplaceholder.typicode.com/todos/1',
  }

  mikealRequest(options1, function(err, resp, body) {
    t.notOk(err, 'should be no error');
    t.true(typeof body !== 'undefined', 'body should not be undefined');
    t.true(body.length !== 0, 'body should not be empty');
    t.end();
  });
});

test('allowUnmocked for dummy POST', {skip: process.env.AIRPLANE}, function(t) {
  nock.cleanAll();

  const body = { title: 'foo',
                 body: 'bar',
                 userId: 1 }
  nock('https://jsonplaceholder.typicode.com', { allowUnmocked: true })
    .persist()
    .post('/posts', body)
    .reply(201, JSON.stringify({ a: 'b' }));
  nock('https://jsonplaceholder.typicode.com', { allowUnmocked: true })
    .persist()
    .post('/posts', body)
    .reply(201, JSON.stringify({ c: 'd' }));
  nock('https://jsonplaceholder.typicode.com', { allowUnmocked: true })
    .persist()
    .post('/posts', body)
    .reply(201, JSON.stringify({ e: 'f' }));

  var optionsForMocked = {
    method: 'POST',
    uri: 'https://jsonplaceholder.typicode.com/posts',
    json: { title: 'foo',
      body: 'bar',
      userId: 1 },
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
  };
  var optionsForUnmocked = {
    method: 'POST',
    uri: 'https://jsonplaceholder.typicode.com/posts',
    json: { title: 'foo',
            body: 'baz',
            userId: 1 },
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
  };

  mikealRequest(optionsForMocked, function(err, resp, body) {
    t.notOk(err, 'should be no error');
  });
  mikealRequest(optionsForUnmocked, function(err, resp, body) {
    t.notOk(err, 'should be no error');
    t.end();
  });
});

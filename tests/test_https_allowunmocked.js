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

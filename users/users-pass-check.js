'use strict';

const util = require('util');
const restify = require('restify-clients');

const client = restify.createJsonClient({
  url: 'http://localhost:'+process.env.PORT,
  version: '*'
});

client.basicAuth('owca', 'T4KI3-H4X3R5KIE-H4SL0');

client.post('/passwordCheck', {
    username: "test", password: "s3cret"
},
(err, req, res, obj) => {
    if (err) console.error(err);
    else console.log('Response '+ util.inspect(obj));
});
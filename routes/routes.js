var express = require('express');
var router = express.Router();
const test = require('./test');

////test
router.get('/check', test.testing);

module.exports = router;
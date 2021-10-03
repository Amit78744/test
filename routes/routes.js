var express = require('express');
var router = express.Router();
const test = require('./test');

////test
router.get('/test', test.testing);

router.get('/getuser', test.getdata);

module.exports = router;
/**
 * Created by honzadvorsky on 31/08/15.
 */
var express = require('express');
var router = express.Router();

var heartbeat = require('./beep');

router.use('/beep', heartbeat);

module.exports = router;

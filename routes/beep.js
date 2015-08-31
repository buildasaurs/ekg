var express = require('express');
var router = express.Router();

/* POST a heartbeat event. */
router.post('/', function(req, res, next) {
  res.send('roger that');
});

module.exports = router;

var express = require('express');
var router = express.Router();

/* POST a heartbeat event. */
router.post('/', function(req, res, next) {
  res.send('roger that: \n' + JSON.stringify(req.body, null, '\t'));
});

/* GET all events */
router.get('/all', function(req, res, next) {
  res.send('not implemented yet, my bad');
});

module.exports = router;

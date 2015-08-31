var express = require('express');
var router = express.Router();
var db = require('./utils/redis');
var eventUtils = require('./utils/events');

/* POST a heartbeat event. */
router.post('/', function(req, res, next) {

    var event = req.body;

    if (eventUtils.validateEvent(event)) {

        saveEvent(event, db(), function(err, eventId) {

            if (err) {
                res.status(500).send('Failed to save event: ' + err);
            } else {
                res.send('(valid) Received Event: \n' + JSON.stringify(event, null, '\t'));
            }
        });
    } else {
        res.status(400).send('Invalid event: \n' + JSON.stringify(req.body, null, '\t'));
    }
});

//TODO: look into async to avoid this callback hell
function saveEvent(event, db, completion) {

    //first get a unique eventId from redis
    db.incr("next_event_id", function(err_id, new_id) {
        if (err_id) {
            completion(err_id, null);
        } else {

            //inject id & timestamp into the event
            event["event_id"] = new_id;
            event["timestamp"] = Date.now();

            //save the event
            db.zadd("events", new_id, JSON.stringify(event), function(err_save, reply_save) {

                if (err_save) {
                    completion(err_save, null);
                } else {
                    //return id
                    completion(null, new_id);
                }
            });
        }
    });
}

/* GET all events */
router.get('/all', function(req, res, next) {
  res.status(500).send('not implemented yet, my bad');
});

/* GET redis ping */
router.get('/redis', function(req, res, next) {
	db().ping(function(err, reply) {
		if (err) {
			res.status(500).send(err);
		} else {
			res.send(reply);
		}
	});
});

module.exports = router;

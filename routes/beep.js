var express = require('express');
var router = express.Router();
var db = require('./utils/redis');
var eventUtils = require('./utils/events');

/* POST a heartbeat event. */
router.post('/', function(req, res, next) {

    var event = req.body;

    if (eventUtils.validateEvent(event)) {

        var saveCompletion = function(err, eventId) {

            if (err) {
                res.status(500).send('Failed to save event: ' + err);
            } else {
                res.send(event);
            }
        };

        if (event['test_generated']) {
            //don't save
            console.log('Skipping saving of test event:\n' + JSON.stringify(event, null, '\t'))
            saveCompletion(null, 12345);
        } else {
            saveEvent(event, db(), saveCompletion);
        }

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

/* GET all events - for implementing views on top of the raw data */
router.get('/all', function(req, res, next) {

    db().zrange("events", 0, -1, function(err, reply) {

        if (err) {
            res.status(500).send(err);
        } else {
            //might be a lot of data
            //TODO: implement paging
            //parse again
            res.send(reply.map(JSON.parse));
        }
    });
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

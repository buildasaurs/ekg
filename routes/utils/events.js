/**
 * Created by honzadvorsky on 31/08/15.
 */

/* make sure the event is valid according to the API */
function validateEvent(event) {

    //required: token
    var token = event.token;
    if (!token || token.isEmpty) {
        return false;
    }

    //required: event-type
    var eventType = event['event_type'];
    var allEventTypes = ["buildasaur.heartbeat", "buildasaur.launch"];
    if (!eventType || eventType.isEmpty || allEventTypes.indexOf(eventType) == -1) {
        return false;
    }

    return true;
}

function addId(event, eventId) {
    event["event_id"] = eventId;
    return event;
}

module.exports = {
    validateEvent: validateEvent,
    addId: addId
};


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
    var allEventTypes = ["heartbeat", "launch"];
    if (!eventType || eventType.isEmpty || allEventTypes.indexOf(eventType) == -1) {
        return false;
    }

    if (eventType === "heartbeat") {
        //required: uptime in seconds
        var uptime = event['uptime'];
        if (!uptime || uptime.isEmpty) {
            return false;
        }
    }

    //required: version
    var version = event['version'];
    if (!version || version.isEmpty) {
        return false;
    }

    //required: build
    var build = event['build'];
    if (!build || build.isEmpty) {
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


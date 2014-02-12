// file scope
var client = null;

function setupClient() {
    if(client) {
        return;
    }

    client = Npm.require('twilio')(Meteor.settings.TWILIO_SID, Meteor.settings.TWILIO_TOKEN);
}

sendSMS = function(to, messageText) {
    setupClient();

    console.log("Sending SMS to " + to + ", body: " + messageText);

    client.messages.create({
        to: to,
        from: "+16193659929", // also +18584141421",
        body: messageText
    }, function(err, message) {
        if( !err ) {
            console.log('Twilio id: ' + message.sid);
        } else {
            console.log("Failed sending message:");
            console.log(err);
        }
    });
};

// file scope
// sugarjs throttle functions must be created once, and called many times in-order to work correctly
var throttleContactFunction = [];


// call this to send a test message to a number
// throttles message rate
testContactSMS = function(contactId) {
    if( !contactId ) {
        return;
    }

    var contact = Contacts.findOne("" + contactId);

    if( !contact ) {
        return;
    }

    var throttleRate = 10000;
    var throttleKey = contact._id + '_' + contact.sms;

    // call immediately and then debounce
    if( !throttleContactFunction[throttleKey] ) {
        throttleContactFunction[throttleKey] = (function(c) {
            sendSMS(contact.sms, "Testing SMS for contact '" + contact.name + "'");
        }).throttle(throttleRate);
    }

    // call
    throttleContactFunction[throttleKey](contact);
};
// file scope
var client = null;

function setupClient() {
    if(client) {
        return;
    }

    client = Npm.require('twilio')(Meteor.settings.TWILIO_SID, Meteor.settings.TWILIO_TOKEN);
}

sendText = function(to, messageText) {
    setupClient();

    client.messages.create({
        to: to,
        from: "+16193659929", // also +18584141421",
        body: messageText
    }, function(err, message) {
        console.log(message.sid);
    });

    console.log(to);
//    console.log(message);
    console.log(Meteor.settings.TWILIO_SID);
}
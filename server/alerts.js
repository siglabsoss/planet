debugSendEmail = function() {

    Email.send({
        from: "bjmorse@gmail.com",
        to: "ben@popwi.com",
        subject: "Subject",
        text: "Some devices are outside the fence"
    });

    console.log('sent');
}


// called in rendered
function bindDashboardElements()
{
    // unbinding is required, without which:
    //   the first click toggles as expected
    //   the second click toggles twice (I think because the jQuery has attached to both forms of the DOM element or something)
    $('.showFenceDrop').off('click');
    
    $('.showFenceDrop').on('click', function(e){

        var newValue = ! Settings.findOne(settingsDocId()).view.showFences;

        Settings.update(settingsDocId(), {$set:{view:{showFences:newValue}}});

        var message = "Fences Shown";
        if( !newValue )
            message = "Fences Hidden";

        console.log(message);

        flashAlertMessage(message, {hideAfter:600});
    });
}

Template.dashboard.rendered = function() {

    // do general stuff

    // (re) Bind all our dom elements
    bindDashboardElements();
}


//FIXME make settings more uniform

getShowFences = function()
{
    var o = Settings.findOne({userId:fakeUserId()});

    // default value
    if( ! (o && o.view) )
        return true;

    return o.view.showFences;
}




// Returns raw html for an alert
// Clears a css class which causes alert to fade away after time
Template.flashAlert.rawHtml = function()
{
    var m = Session.get("flashAlertMessageObject");
    if( !m )
        return "";

    // See: http://stackoverflow.com/questions/7676356/can-twitter-bootstrap-alerts-fade-in-as-well-as-out
    setTimeout(function(){
        $('#myFlashAlert').removeClass('fadein');
        setTimeout(function(){Session.set("flashAlertMessageObject", null);},100); // remove session var after fade has completed or template rerender will instantly remove
    }, m.options.hideAfter);

    return "<div id='myFlashAlert' class='alert alert-" + m.options.type + " fade fadein floatingAlert'>"+ m.message+"</div>";
}

// Call to flash a message to the user which will fade away. The options parameter is optional
flashAlertMessage = function(message, options)
{
    var def = {hideAfter:3000,type:'success'}

    options = typeof options !== 'undefined' ? options : def;
    options.hideAfter = options.hideAfter || def.hideAfter;
    options.type = options.type || def.type;

    Session.set("flashAlertMessageObject", {message:message,options:options});

}
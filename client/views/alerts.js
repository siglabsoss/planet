Template.alerts.alerts = function() {
    return Alerts.find();
}

Template.alert.viewEditing = function() {
    return Session.equals("alertViewEditingId", this._id);
}

Template.alert.rendered = function() {

    // unlike a template helper, .rendered() can get the mongo data using this.data and not just this
    // this weird call allows us to DRY by calling a template helper
    if( Template.alert.viewEditing.call(this.data) ) {
        // bind and pop
        bindAlertEditInPlaceAndShow(this.data);
    }
}

// returns comma separated list of contacts
Template.alert.contactsPlainText = function() {
    if( this.contacts && Array.isArray(this.contacts) && this.contacts.length != 0 ) {
        var result = "";

        this.contacts.each(function(cId){
            var c = Contacts.findOne(cId);
            if( c && c.name ) {
                result = result + Contacts.findOne(cId).name +  ', ';
            }
        });
        return result;
    }

    return "(none)";
};

function alertEditableDOMSelectors(data) {

    var prefix = [
        "#alertName_"
//        "#contactEmailList_",
//        "#contactSmsList_"
    ];

    var results = [];

    // prefix + id = selector
    prefix = prefix.each(function(p){
        results.push(p + "" + data._id);
    });

    return results;
}


// This is a list of selectors which to bind the edit in place js
function alertSelect2DOMSelectors(data) {

    var prefix = [
        "#alertFormGroupInput_"
//        "#contactEmailList_",
//        "#contactSmsList_"
    ];

    var results = [];

    // prefix + id = selector
    prefix = prefix.each(function(p){
        results.push(p + "" + data._id);
    });

    return results;
}

editAlertFormPendingChanges = [];

function bindAlertEditInPlaceAndShow(data) {


    var select2sels = alertSelect2DOMSelectors(data);


    editAlertFormPendingChanges = [];


    select2sels.each(function(selector){

        // clear/setup pending changes array
        editAlertFormPendingChanges[data._id] = [];
        editAlertFormPendingChanges[data._id][selector] = [];

        var $selector = $(selector);



        var select2options = {
            multiple: true,
            placeholder: "Select contacts to notify.",
            width: '100%',

            // when the user types
            query: function (query) {

                // build regex to find text anywhere in field
                var expression = ".*"+query.term+".*";
                var rx = RegExp(expression,'i');

                // search mongo
                var documents = Contacts.find({name:rx}).fetch();

                // callback is expecting a results member
                var data = {
                    results: convertDocumentsSelect2(documents)
                };

                query.callback(data);
            },
            initSelection: function(element, callback) {
                // don't care what element is bc we already know

                var initialSelection = [];

                if( data.contacts && Array.isArray(data.contacts) ) {
                    initialSelection = Contacts.find({_id: {$in: data.contacts}}).fetch();
                }

                // callback is just expecting an array
                callback(convertDocumentsSelect2(initialSelection));
            }
        };


        // build select2
        $selector.select2(select2options);

        // WHAT IS WRONG? we need this line, but it has no data.  The data came from initSelection()
        $selector.select2("val", []);

        // bind change
        $selector.on("change", function(e) {
            // here e has a lot of stuff in it. including e.val which is an array of the full set
            // we only deal in deltas tho

            if( e && e.added && e.added.id ) {

                // push change made by user into a queue which we can execute later when they press 'save'
                editAlertFormPendingChanges[data._id][selector].push(function(){
                    Alerts.update(data._id, {$addToSet:{'contacts': e.added.id}});
                });
            }

            if( e && e.removed && e.removed.id ) {

                // push change made by user into a queue which we can execute later when they press 'save'
                editAlertFormPendingChanges[data._id][selector].push(function(){
                    Alerts.update(data._id, {$pull:{'contacts': e.removed.id}});
                });
            }
        });


    }); //each select2sels


    var inputSels = alertEditableDOMSelectors(data);

    inputSels.each(function(selector){

        // we are probably binding to a span
        var $selector = $(selector);

        var options = {
            title: 'Enter value',
            success: function(response, newValue) {

                // success callback gets called with this set to the span.  However we can use a few references to find the <input> tag

                var $span = $(this);

                var field = $span.attr('data-name');

                var $input = this.data('editable').input.$input;


                // This is reactive, not sure if this should go first, or if Contacts.update()
                Session.set("alertViewEditingId", null);

                // build query to update the specific field
                var query = {$set:{}};
                query.$set[field] = $input.val();

                // Update model
                Alerts.update(data._id, query);

                return true;
            }
        };

        // look at the html from the temlpate to see if it has this attr
        var inputClass = $selector.attr('data-has-class');
        if( inputClass && typeof inputClass === "string")
        {
            // if so we want to set this option for the edit in place
            options.inputclass = inputClass; // notice caps
        }

        // create and bind
        $selector.editable(options);

        // activate
        $selector.editable('show');

        // Now that we've shown it, we can do this if we want
        //   $selector.data('editable').input.$input.val()  or .addClass() or whatever

    });


}


Template.alerts.events({
    "click i.plus-button-green": function(e) {

//        var editingId = Random.id();
//
//        var obj = {
//            name: OctoNameGenerator.get({wordSet:'geo'}),
//            emails: "",
//            sms: "",
//            _id: editingId
//        };
//
//        Session.set("alertViewNewObject", obj);
//
//        if( !Session.get("alertViewEditingId") )
//            Session.set("alertViewEditingId", editingId);

    },
    'click .save-alert-form-data': function(e) {

//        var newRow = Session.get("alertViewNewObject");
//
//        // if we are clicking save on a new alert, we must first insert a doc before the loop below calls update
//        if( newRow && newRow._id && newRow._id === this._id ) {
//            Alerts.insert(newRow);
//            Session.set("alertViewNewObject", null);
//        }
//
//        // this is data
        var sels = alertEditableDOMSelectors(this);

        sels.each(function(selector){
            $(selector).editable('submit');
        });

        var that = this;


        var select2sels = alertSelect2DOMSelectors(this);

        select2sels.each(function(selector){
            // all the saved changes to the select2 are built into a function, and added to a list of pending changes
            if( editAlertFormPendingChanges && typeof editAlertFormPendingChanges[that._id] === "object" && Array.isArray(editAlertFormPendingChanges[that._id][selector]) ) {

                editAlertFormPendingChanges[that._id][selector].each(function(fn){
                    if( typeof fn === "function" ) {
                        // call the single change, in the list of changes that the user made to the select2
                        fn();
                    } // if
                }); // each functions
            } // if
        }); // each select2sels
    },
    'click .cancel-alert-form-data': function(e) {

        // user clicked cancel on the virtualy created row, so unset it
//        var newRow = Session.get("alertViewNewObject");
//        if( newRow && newRow._id === this._id ) {
//            Session.set("alertViewNewObject", null);
//        }
        Session.set("alertViewEditingId", null);

        // delete pending changes for this alert
        editAlertFormPendingChanges[this._id] = [];
    },
    'click .edit-alert-form-data': function(e) {
        // set session variable to reactivly change stuff in the template
        Session.set("alertViewEditingId", this._id);


        // I tried putting jquery stuff here, but since we JUST changed a reactive thingy, the template insta-re-renders
    },
    'click .delete-alert-form-data': function(e) {

        var newRow = Session.get("alertViewNewObject");

        if (confirm('Are you sure you want to delete this alert?')) {

            if( newRow && newRow._id === this._id ) {
                Session.set("alertViewNewObject", null);
            } else {
                Alerts.remove(this._id);
            }

            flashAlertMessage("Alert deleted", {hideAfter:2000});
        } else {
            // Do nothing!
        }

    }
});
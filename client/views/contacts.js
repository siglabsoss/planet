// These are the defaults for bootstrap-editable.js
var contactsBootstrapEditableDefaults =  {
    mode: 'inline',
    toggle: 'manual',
    showbuttons: false,
    onblur: 'ignore',
    inputclass: 'input-large',
    savenochange: false
};
$.extend($.fn.editable.defaults, contactsBootstrapEditableDefaults);

Template.contacts.contacts = function() {
    var results = Contacts.find().fetch();

    var newRow = Session.get("contactViewNewObject")

    if( newRow && typeof newRow === "object" )
    {
        results.add(newRow);
    }

    return results;
}

// This is a list of selectors which to bind the edit in place js
function editableDOMSelectors(data) {

    var prefix = [
        "#contactName_",
        "#contactEmailList_",
        "#contactSmsList_"
    ];

    var results = [];

    // prefix + id = selector
    prefix = prefix.each(function(p){
        results.push(p + "" + data._id);
    });

    return results;
}

Template.contact.rendered = function() {

    // unlike a template helper, .rendered() can get the mongo data using this.data and not just this
    // this weird call allows us to DRY by calling a template helper
    if( Template.contact.viewEditing.call(this.data) ) {
        // bind and pop
        bindEditInPlaceAndShow(this.data);
    }
}

// returns true if this contact is being edited
// note we use Session.equals() because http://stackoverflow.com/questions/21159270/is-it-better-to-reuse-or-recreate-a-reactive-source-in-meteor
Template.contact.viewEditing = function() {
    return Session.equals("contactViewEditingId", this._id);
}

function bindEditInPlaceAndShow(data) {

    var sels = editableDOMSelectors(data);

    sels.each(function(selector){

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
                Session.set("contactViewEditingId", null);

                // build query to update the specific field
                var query = {$set:{}};
                query.$set[field] = $input.val();

                // Update model
                Contacts.update(data._id, query);

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


Template.contacts.events({
    "click i.plus-button-green": function(e) {

        var editingId = Random.id();

        var obj = {
            name: OctoNameGenerator.get({wordSet:'geo', wordTypes:['verbs','nouns']}),
            emails: "",
            sms: "",
            _id: editingId
        };

        Session.set("contactViewNewObject", obj);

        if( !Session.get("contactViewEditingId") )
            Session.set("contactViewEditingId", editingId);

    },
    'click .save-contact-form-data': function(e) {

        var newRow = Session.get("contactViewNewObject");

        // if we are clicking save on a new concat, we must first insert a doc before the loop below calls update
        if( newRow && newRow._id && newRow._id === this._id ) {
            Contacts.insert(newRow);
            Session.set("contactViewNewObject", null);
        }

        // this is data
        var sels = editableDOMSelectors(this);

        sels.each(function(selector){
            $(selector).editable('submit');
        });
    },
    'click .cancel-contact-form-data': function(e) {

        // user clicked cancel on the virtualy created row, so unset it
        var newRow = Session.get("contactViewNewObject");
        if( newRow && newRow._id === this._id ) {
            Session.set("contactViewNewObject", null);
        }
        Session.set("contactViewEditingId", null);
    },
    'click .edit-contact-form-data': function(e) {
        // set session variable to reactivly change stuff in the template
        Session.set("contactViewEditingId", this._id);


        // I tried putting jquery stuff here, but since we JUST changed a reactive thingy, the template insta-re-renders
    },
    'click .delete-contact-form-data': function(e) {

        var newRow = Session.get("contactViewNewObject");

        if (confirm('Are you sure you want to delete this contact?')) {

            if( newRow && newRow._id === this._id ) {
                Session.set("contactViewNewObject", null);
            } else {
                Contacts.remove(this._id);
            }

            flashAlertMessage("Contact deleted", {hideAfter:2000});
        } else {
            // Do nothing!
        }

    }
});
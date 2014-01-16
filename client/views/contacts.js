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
    return Contacts.find();
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

Template.contact.viewEditing = function() {
    return Session.get("contactViewEditingId") === this._id;
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

                var query = {$set:{}};
                query.$set[field] = $input.val();

                console.log(query);

                // This is reactive
                Session.set("contactViewEditingId", null);

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
//        e.preventDefault();
//        console.log("new");

//        debugger;




    },
    'click .save-contact-form-data': function(e) {
        // this is data
        var sels = editableDOMSelectors(this);

        sels.each(function(selector){
            $(selector).editable('submit');
        });
    },
    'click .cancel-contact-form-data': function(e) {
        Session.set("contactViewEditingId", null);
    },
    'click .edit-contact-form-data': function(e) {
        var id = $(e.target).attr('data-id');

        // set session variable to reactivly change stuff in the template
        if( id && typeof id === "string") {
            Session.set("contactViewEditingId", id);
        }

        // I tried putting jquery stuff here, but since we JUST changed a reactive thingy, the template insta-re-renders

    }
});
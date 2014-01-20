"use-strict";

// This file (As well as contcats) is setup funny.
// The types and number of editible inputs are determined by selectors returned from these functions:
//   alertEditableDOMSelectors
//   alertSelect2DOMSelectors

// There should be a better way to set this up, and they each require so much custom javascript.

/* Steps to add an input field:
1) copy pasta html, give unique id, and update all data- attributes correctly
2) update one of ...Selectors functions listed above
3) update getCollection, getField
4) add template variable like ...PlainText and update html
*/

Template.alerts.alerts = function() {
    var results = Alerts.find().fetch();

    var newRow = Session.get("alertViewNewObject")

    if( newRow && typeof newRow === "object" )
    {
        results.add(newRow);
    }

    return results;
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

function getPlainText(string) {

    var collection = getCollection(string);
    var fieldName = getField(string);

    if( collection && fieldName && this[fieldName] && Array.isArray(this[fieldName]) && this[fieldName].length != 0 ) {
        var result = "";

        this[fieldName].each(function(linkedId){
            var object = collection.findOne(linkedId);
            if( object && object.name ) {
                result = result + object.name +  ', ';
            }
        });
        return result;
    }

    return "(none)";
}

// returns comma separated list of contacts
Template.alert.contactsPlainText = function() {
    return getPlainText.call(this, "Contacts");
};

Template.alert.groupsPlainText = function() {
    return getPlainText.call(this, "Groups");
};

Template.alert.ruleTypeString = function () {
    var string = "(none)";

    if( this.rule && this.rule.type ) {
        string = this.rule.type;
    }

    return string;
}

// List of all text input type selectors
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



// List of all select2 plugin controlled inputs (single and multiple select aka "tokenized field")
function alertSelect2DOMSelectors(data) {

    var prefix = [
        "#alertFormContactInput_"
        ,"#alertFormGroupInput_"
        ,"#alertFormRuleInput_"
    ];

    var results = [];

    // prefix + id = selector
    prefix = prefix.each(function(p){
        results.push(p + "" + data._id);
    });

    return results;
}



// Global Scope
alertRuleTypes = ["diabled", "keepin", "keepout"];

// Client side only fake collection
// Just used to make search easy lol
AlertRuleTypesCollection = new Meteor.Collection("alertRuleTypes",{connection:null});

alertRuleTypes.each(function(value){
    var doc = {name:value, text:value};
    AlertRuleTypesCollection.insert(doc);
});

// pass in string, returns collection
function getCollection(string){
    switch(string){
        case "Contacts":
            return Contacts;
            break;
        case "Groups":
            return Groups;
            break;
        case "AlertRuleTypes":
            return AlertRuleTypesCollection;
            break;
    }
    return null;
}

// pass in string, returns collection
function getField(string){
    switch(string){
        case "Contacts":
            return "contacts";
            break;
        case "Groups":
            return "groups";
            break;
    }
    return null;
}

// global scope
alertGetTypeNiceName = function(string)
{
    switch(string){
        case "keepin":
            return "Keep in Fence";
            break;
        case "keepout":
            return "Keep out of Fence";
            break;
        default:
        case "disabled":
            return "Disabled";
            break;
    }
    return "";
}

Template.alert.getTypeNiceName = function() {
    if( this.rule && this.rule.type ) {
        return alertGetTypeNiceName(this.rule.type);
    } else {
        return alertGetTypeNiceName(null); // the default
    }
}

editAlertFormPendingChanges = [];

function bindAlertEditInPlaceAndShow(data) {


    var select2sels = alertSelect2DOMSelectors(data);


//    editAlertFormPendingChanges = [];

    // "tokenized field"
    select2sels.each(function(selector){

        // clear/setup pending changes array
        if( !Array.isArray(editAlertFormPendingChanges[data._id]) ) {
            editAlertFormPendingChanges[data._id] = []; // build to array if first time
        }
        editAlertFormPendingChanges[data._id][selector] = [];

        var $selector = $(selector);

        var attribute = $selector.attr('data-collection');

        // depending on this data member, we search a different collection with this select2
        var collection = getCollection(attribute);

        // depending on this data member, we update the correct field
        var fieldName = getField(attribute);


        // is this input a multiple?
        var isMultiple = false;
        if( $selector.attr('data-is-multiple') === 'true') {
            isMultiple = true;
        }

        // if true, we are selecting a single thing from a member on us via dot notation
        var isDotNotation = false;
        var dotNotationString = $selector.attr('data-dot-notation');
        if( dotNotationString && typeof dotNotationString === "string" ) {
            isDotNotation = true;
        }


        var select2options = {
            multiple: isMultiple,
            placeholder: $selector.attr('data-placeholder-text'),
            width: '100%',

            // when the user types
            query: function (query) {

                // build regex to find text anywhere in field
                var expression = ".*"+query.term+".*";
                var rx = RegExp(expression,'i');

                // search mongo
                var documents = collection.find({name:rx}).fetch();

                // callback is expecting a results member
                var data = {
                    results: convertDocumentsSelect2(documents)
                };

                query.callback(data);
            },
            initSelection: function(element, callback) {
                // don't care what element is bc we already know

                var initialSelection = [];

                var fetchedValue = DDot.match(dotNotationString).fetch(data);

                if( isDotNotation && data && fetchedValue ) {
                    initialSelection = collection.find({name: fetchedValue}).fetch();

                    // callback is just expecting an array
                    callback(convertDocumentsSelect2(initialSelection).first());
                } else {
                    if( data && data[fieldName] && Array.isArray(data[fieldName]) ) {
                        initialSelection = collection.find({_id: {$in: data[fieldName]}}).fetch();

                        // callback is just expecting an array
                        callback(convertDocumentsSelect2(initialSelection));
                    }
                }


            }
        };


        // build select2
        $selector.select2(select2options);



        if( isDotNotation ) {
            // Still a bit confused about this
            $selector.select2("val", {id:data._id});
        } else {
            // WHAT IS WRONG? we need this line, but it has no data.  The data came from initSelection()
            $selector.select2("val", []);
        }

        // bind change
        $selector.on("change", function(e) {
            // here e has a lot of stuff in it. including e.val which is an array of the full set
            // we only deal in deltas tho

            if( isDotNotation ) {
                if( e && e.type && e.type === "change" && e.added && e.added.id ) {

                    // push change made by user into a queue which we can execute later when they press 'save'
                    editAlertFormPendingChanges[data._id][selector].push(function(){

                        // look at our fake collection to pull the value
                        var value = collection.findOne(e.added.id);

                        if( value && value.name ) {

                            // set it by name
                            var query = {$set:{}};
                            query.$set[dotNotationString] = value.name;
                            Alerts.update(data._id, query);
                        }
                    });
                }
            } else {

                if( e && e.added && e.added.id ) {

                    // push change made by user into a queue which we can execute later when they press 'save'
                    editAlertFormPendingChanges[data._id][selector].push(function(){
                        var query = {$addToSet:{}};
                        query.$addToSet[fieldName] = e.added.id;
                        Alerts.update(data._id, query);
                    });
                }

                if( e && e.removed && e.removed.id ) {

                    // push change made by user into a queue which we can execute later when they press 'save'
                    editAlertFormPendingChanges[data._id][selector].push(function(){
                        var query = {$pull:{}};
                        query.$pull[fieldName] = e.removed.id;
                        Alerts.update(data._id, query);
                });
                }
            }
        });


    }); //each select2sels


    var inputSels = alertEditableDOMSelectors(data);

    // text input
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

        var editingId = Random.id();

        var obj = {
            name: OctoNameGenerator.get({wordSet:'geo', wordTypes:['verbs','adjectives']}),
            contacts: [],
            groups: [],
            rule:{type:'keepout'},
            _id: editingId
        };
//
        Session.set("alertViewNewObject", obj);

        if( !Session.get("alertViewEditingId") )
            Session.set("alertViewEditingId", editingId);

    },
    'click .save-alert-form-data': function(e) {

        var newRow = Session.get("alertViewNewObject");

        // if we are clicking save on a new alert, we must first insert a doc before the loop below calls update
        if( newRow && newRow._id && newRow._id === this._id ) {
            Alerts.insert(newRow);
            Session.set("alertViewNewObject", null);
        }

        // this is data
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
        var newRow = Session.get("alertViewNewObject");
        if( newRow && newRow._id === this._id ) {
            Session.set("alertViewNewObject", null);
        }
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
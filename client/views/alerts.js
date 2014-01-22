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



// Global Scope
alertRuleTypes = ["disabled", "keepin", "keepout"];

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
popHandles = [];

function bindAlertEditInPlaceAndShow(data) {

    // reset this to prevent lingering handles from previous edits
    popHandles = [];

    var groupHandle = PopEditField.MultiInput('#alertFormGroupInput_'+data._id,{
        editingCollection:Alerts,
        searchedCollection:Groups,
        data:data,
        fieldName:"groups"
    });

    popHandles.push(groupHandle);

    var contactHandle = PopEditField.MultiInput('#alertFormContactInput_'+data._id,{
        editingCollection:Alerts,
        searchedCollection:Contacts,
        data:data,
        fieldName:"contacts"
    });

    popHandles.push(contactHandle);

//    this is a single input (As marked by data-is-multiple in the DOM), we use dotNotationString instead of fieldName
    var ruleHandle = PopEditField.SingleInput('#alertFormRuleInput_'+data._id,{
        editingCollection:Alerts,
        searchedCollection:AlertRuleTypesCollection,
        data:data,
        dotNotationString: "rule.type"
    });

    popHandles.push(ruleHandle);

    var nameHandle = PopEditField.TextInput('#alertName_'+data._id,{
        editingCollection:Alerts,
        data:data,
        fieldName:"name"
    });

    popHandles.push(nameHandle);

}


Template.alerts.events({
    "click i.plus-button-green": function(e) {

        var editingId = Random.id();

        var obj = {
            name: OctoNameGenerator.get({wordSet:'geo', wordTypes:[,'adjectives']}) + '-alert',
            contacts: [],
            groups: [],
            rule:{type:'keepout'},
            _id: editingId
        };

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

        popHandles.each(function(handle){
           if( typeof handle === "object") {
               handle.saveChanges();
           }
        });

        // This is reactive, not sure if this should go first, or if Contacts.update()
        Session.set("alertViewEditingId", null);


        // this may or may not help reduce memory
        popHandles.each(function(handle){
            if( typeof handle === "object") {
                handle.destroy();
            }
        });
        popHandles = [];

    },
    'click .cancel-alert-form-data': function(e) {

        // user clicked cancel on the virtualy created row, so unset it
        var newRow = Session.get("alertViewNewObject");
        if( newRow && newRow._id === this._id ) {
            Session.set("alertViewNewObject", null);
        }

        Session.set("alertViewEditingId", null);

        // submit all of the PopEditField objects
        popHandles.each(function(handle){
            if( typeof handle === "object") {
                handle.destroy();
            }
        });
        popHandles = [];
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
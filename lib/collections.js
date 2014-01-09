Devices = new Meteor.Collection("devices");
DeviceLocations = new Meteor.Collection("deviceLocations");
Settings = new Meteor.Collection("settings");
Logs = new Meteor.Collection("logs");
Groups = new Meteor.Collection("groups");
Fences = new Meteor.Collection("fences");
Events = new Meteor.Collection("events");
Alerts = new Meteor.Collection("alerts");

if (Meteor.isServer){

    Meteor.startup(function(){
// This is how we add mongo indexes
//        Friends._ensureIndex({uid: 1, owner: 1}, {unique: 1});

    });
}
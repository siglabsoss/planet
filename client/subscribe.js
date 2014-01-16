// This has gobal scope on the client
clientOccludedGroups = [];

clientOccludedGroupsDep = new Deps.Dependency;

Meteor.startup(function () {

    Meteor.subscribe("groups");
    Meteor.subscribe("fences");
    Meteor.subscribe("alerts");
    Meteor.subscribe("contacts");


    Deps.autorun(function() {

        // calculate a list of VISIBLE groups after they have been occluded
        var occludedGroups = occludeVisibleGroups(Groups.find().fetch(), getUserSetting('map.view.visibleGroups'));

        clientOccludedGroups = occludedGroups;
        clientOccludedGroupsDep.changed();

        return Meteor.subscribe("groupFilteredDevices", occludedGroups);
    });

});
Meteor.startup(function () {

    Meteor.subscribe("groups");
    Meteor.subscribe("fences");


    Deps.autorun(function() {
        return Meteor.subscribe("groupFilteredDevices", getUserSetting('map.view.visibleGroups'));
    });

});
Meteor.startup(function () {
    Meteor.publish("groupFilteredDevices", function (groupArray) {

        var groups = null;

        if( groupArray && _.isArray(groupArray) )
            groups = groupArray;

        if( groups ) {


//            var parentGroups = [];
//
//            // build a list of all direct parents under the top level groups provided
//            groups.each(function(g) {
//               parentGroups = parentGroups.add(groupsUnderGroup(g));
//            });

//            console.log(parentGroups);

//            var devices = devicesInGroup(groups.first());
//            console.log(devices);
            return Devices.find({parents:{$in:groups}});
        } else {
            return Devices.find({});
        }
    });

    Meteor.publish("groups", function () {
        return Groups.find({});
    });

    Meteor.publish("fences", function () {
        return Fences.find({});
    });

    Meteor.publish("devices", function () {
        return Devices.find({});
    });



    // Permissions
    Devices.allow({
        update: function(userId, docs, fields, modifier) {
            return true;
        }
    });

});
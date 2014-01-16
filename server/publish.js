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


        // This is a very inefficient way of counting how many devices are in each group
        // This code calculates the value, and then with self.added() it creates a "generated" field that is never stored in the DB
        // See http://docs.meteor.com/#meteor_publish
        var self = this;

        var updateCounts = function(added) {
            var temp = Groups.find().fetch();
            temp.each(function(g) {
                var count = devicesInGroup(g).length; // This returns the entire object which is wasteful
                if( added ) {
                    self.added("groups", g._id, {devicesInGroupCount: count});
                } else {
                    self.changed("groups", g._id, {devicesInGroupCount: count});
                }
            });
            self.ready();
        };


        var timeoutHandle;
        var debounceMs = 100;

        // this observes whenever the 'parents' field of any device changes
        // then it calls updateCounts() with a debounce because updateCounts actually scans and counts the entire database (not just for one device)
        var handle = Devices.find({},{fields: {parents: 1}}).observeChanges({
            added: function (id) {
//                console.log('added');
                if( timeoutHandle )
                    Meteor.clearTimeout(timeoutHandle);
                timeoutHandle = Meteor.setTimeout(function(){updateCounts(true);},debounceMs);

            },
            changed: function(id, fields) {
//                console.log('changed:');
                if( timeoutHandle )
                    Meteor.clearTimeout(timeoutHandle);
                timeoutHandle = Meteor.setTimeout(function(){updateCounts(false);},debounceMs);
            },
            removed: function (id) {
//                console.log('removed');
                if( timeoutHandle )
                    Meteor.clearTimeout(timeoutHandle);
                timeoutHandle = Meteor.setTimeout(function(){updateCounts(false);},debounceMs);
            }
            // don't care about moved
        });


        return Groups.find({});
    });

    Meteor.publish("fences", function () {
        return Fences.find({});
    });

    Meteor.publish("devices", function () {
        return Devices.find({});
    });

    Meteor.publish("alerts", function () {
        return Alerts.find({});
    });



    // Permissions
    Devices.allow({
        update: function(userId, docs, fields, modifier) {
            return true;
        }
    });

    Alerts.allow({
        insert: function(userId, doc) {
            return true;
        },
        update: function(userId, docs, fields, modifier) {
            return true;
        },
        remove: function(userId, doc) {
            return true;
        }
    });

});
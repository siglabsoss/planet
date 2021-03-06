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

            var basicQuery = {parents:{$in:groups}};


            // the groups collection has the ungroupedMagicGroup() object (artifically) added to it
            // so the user can decide to either show or hide the group
            // here we detect that, and build a special $or query
            if( groups.indexOf(ungroupedMagicGroup()._id) !== -1 ) {
                // look for devices that do not have a 0'th element in the parents (groups) field (aka parents is null or empty list)
                return Devices.find({
                    $or: [
                        {'parents.0':{ $exists: false}},
                        basicQuery
                    ]
                });
            } else {
                return Devices.find(basicQuery);
            }

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

            var ungrouped = ungroupedMagicGroup();

            var ungroupedCount = Devices.find({'parents.0':{ $exists: false}}).fetch().count();

            if( added ) {
                self.added("groups", ungrouped._id, {devicesInGroupCount: ungroupedCount,name:ungrouped.name});
            } else {
                self.changed("groups", ungrouped._id, {devicesInGroupCount: ungroupedCount});
            }


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

    Meteor.publish("contacts", function () {
        return Contacts.find({});
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

    Contacts.allow({
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

    Fences.allow({
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

    Groups.allow({
        insert: function(userId, doc) {

            // prevent name collision
            if( doc.name === ungroupedMagicGroup().name )
                return false;

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
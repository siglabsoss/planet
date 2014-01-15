devicesInGroup = function(groupId){
    var devices = [];

    var groupObject = Groups.findOne(groupId);

    // flat array of just _ids which will prevent the while() below from infinite iterations if something is wrong in the database
    var preventCycles = [groupObject._id];

    // start loop off with the topmost group
    var groupsUnderGroup = [groupObject];

    // this while loop takes the first entry of groupsUnderGroup, grabs all the devices under it, and also adds any subgroups back to the array
    while( groupsUnderGroup.length != 0 )
    {

        var id = groupsUnderGroup.pop()._id;

        // look for groups have this group as parent, note that parents is an array with at maximum 1 entry (groups cannot belong to multiple groups)
        var newGroups = Groups.find({parents:id}).fetch();

        var b = false;
        newGroups.each(function(g) {
            if(preventCycles.find(g._id))
            {
                b = true;
                console.log("Possible cycle detected; group id " + g._id);
            }
            else
            {
                preventCycles.add(g._id);
            }
        });
        if(b) break;

        // append for future iterations
        groupsUnderGroup = groupsUnderGroup.add(newGroups);

        // parents is an array, but the following query actually searches for devices which have this value IN the array (a bit tricky)
        // find direct parents
        devices = devices.add(Devices.find({parents:id}).fetch());
    }

    // remove dups caused by devices belonging to multiple groups under the requested group
    devices = devices.unique();

    return devices;
}

// returns an array of all the groups id's under the group id, including the original group
// (hacked from above)
groupsUnderGroup = function(groupId){

    var groupObject = Groups.findOne(groupId);

    // flat array of just _ids which will prevent the while() below from infinite iterations if something is wrong in the database
    var preventCycles = [groupObject._id];

    // start loop off with the topmost group
    var groupsUnderGroup = [groupObject];

    // this while loop takes the first entry of groupsUnderGroup, grabs all the devices under it, and also adds any subgroups back to the array
    while( groupsUnderGroup.length != 0 )
    {

        var id = groupsUnderGroup.pop()._id;

        // look for groups have this group as parent, note that parents is an array with at maximum 1 entry (groups cannot belong to multiple groups)
        var newGroups = Groups.find({parents:id}).fetch();

        var b = false;
        newGroups.each(function(g) {
            if(preventCycles.find(g._id))
            {
                b = true;
                console.log("Possible cycle detected; group id " + g._id);
            }
            else
            {
                preventCycles.add(g._id);
            }
        });
        if(b) break;

        // append for future iterations
        groupsUnderGroup = groupsUnderGroup.add(newGroups);
    }

    // remove dups
    preventCycles = preventCycles.unique();

    return preventCycles;
}
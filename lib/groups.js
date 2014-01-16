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

// takes an array of database documents that have a 'parents' which is an array of id's, and returns
// a nested object
buildDocumentHeirarchy = function(g)
{

    var worstCaseIterations = g.length + 1;
    var output = [];
    for (var i in g) {
        g[i].children = [];
    }

    // add all the top level parents
    for (var i in g) {
        var node = g[i];
        if( (!node.parents) || node.parents.length === 0 )
        {
            node.depth = 0;
            output.push(node);
            delete(g[i]); //delete node from input because we've successfully attached it
        }
    }

    // for some reason delete in javascript leaves undefined in the array, this fixes that
    g = g.compact();

//    debugger;


    var fullyOrdered;

//    debugger;
    // running attachChild for every node is not guaranteed to work the first time
    do
    {
        if( !worstCaseIterations-- )
        {
            console.log("Something went wrong when searching for parent nodes");
            break;
        }
        // start out assuming things are ok
        fullyOrdered = true;
        for (var i in g) {
            var node = g[i];

            // try to attach the child.  If we are attaching a child to a parent that hasn't been attached yet, we loop through again
            var success = attachChild(output, node, 1);

            // if a single pass fails, set this flag which will make the while go again
            if( !success )
            {
                fullyOrdered = false;
            }
            else
            {
                delete(g[i]); // mark the node as attached by deleting it so we don't re-attach forever
            }
        }

    }
    while (!fullyOrdered);


    return output;
}

// returns true for success, false for failure.  This is used as part of buildDocumentHeirarchy
function attachChild(output, child, depth)
{
    var ret = true;
    var childrenEntered = false; // set to true once we recurse into children
    for(var i in output)
    {
        if( child.parents.find(output[i]._id) )
        {
            child.depth = depth;

            output[i].children.push(child);

            // remove the parent we just attached
            child.parents = child.parents.exclude(output[i]._id);

            // only say success if we've attached to all the parents
            if( child.parents.length === 0 )
                return true;
        }
        if( output[i].children.length != 0 )
        {
            childrenEntered = true;
            ret = ret && attachChild(output[i].children, child, depth + 1);
        }
    }
    return ret && childrenEntered; // if we haven't looked at any children, ret will be incorrectly set to false which the && prevents
}
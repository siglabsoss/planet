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
buildDocumentHeirarchy = function(input)
{
    // clone
    var g = crudeClone(input);

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

function removeChildById(output, childId)
{
    var ret = true;
    var childrenEntered = false; // set to true once we recurse into children
    for(var i in output)
    {
        if( output[i]._id === childId )
        {
            delete(output[i]);
            return true;

        }
        if( output[i].children.length != 0 )
        {
            childrenEntered = true;
            ret = ret && removeChildById(output[i].children, childId);
        }
    }
    return ret && childrenEntered; // if we haven't looked at any children, ret will be incorrectly set to false which the && prevents
}

// crawls an object created by buildDocumentHeirarchy() and returns a flat array of ids
crawlHeirarchyForIds = function(output)
{
    var ret = [];
    for(var i in output)
    {
        if( output[i]._id )
        {
            ret = ret.add(output[i]._id);
        }
        if( output[i].children.length != 0 )
        {
            ret = ret.add(crawlHeirarchyForIds(output[i].children));
        }
    }
    return ret;
}


// Takes an array of groups, and an array of group id's, and returns the id's that are visible based on the Heirarchy of the groups
// (ie hiding a child hides all its children)
occludeVisibleGroups = function(groupDocuments, visibleGroups){

    if( ! _.isArray(groupDocuments) )
        return [];

    if( ! _.isArray(visibleGroups) )
        return [];

    var hiddenGroups = [];

    groupDocuments.each(function(g){
        if(visibleGroups.indexOf(g._id) === -1) {
            hiddenGroups.push(g._id);
        }
    });

    // this gives us a nested object which allows for "occlusion" very easily by just deleting members (which may be entire subtrees)
    var heirarchy = buildDocumentHeirarchy(groupDocuments);

    // remove all the hidden children
    hiddenGroups.each(function(g){
        removeChildById(heirarchy, g);
    });

    var flat = crawlHeirarchyForIds(heirarchy);

    return flat;
}

// pulled from http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
function crudeClone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = crudeClone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = crudeClone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}
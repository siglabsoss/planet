function dragIsAllowed(placeholder, placeholderParent, originalItem)
{
    // device is not allowed to be a parent in any case
    if( placeholderParent && placeholderParent[0].id.substring(0,10) === "devicelist")
        return false;


    return true;
}

groupOrderChanged = function(newParentId, nodeId)
{
    var namedParentId = newParentId;

    // print null
    if( newParentId == null )
        namedParentId = null;


    var parentIdTruncated = null;
    if( newParentId )
    {
        if( newParentId.substring(0, 10) === 'grouplist_' )
            parentIdTruncated = newParentId.substring(10);

        if( newParentId.substring(0, 11) === 'devicelist_' )
            parentIdTruncated = newParentId.substring(11);
    }


    console.log(namedParentId + " is now parent of " + nodeId);


    // grouplist_
    // devicelist_

    if( nodeId.substring(0, 10) === "grouplist_" )
    {
        // the thing that moved was a group
        var nodeIdTruncated = nodeId.substring(10); // these id's in the dom are prefixed by 'mongo_' so remove the first n chars

        Groups.update(nodeIdTruncated, {$set:{parent:parentIdTruncated}});
    }

    if( nodeId.substring(0, 11) === 'devicelist_' )
    {
        // the thing that moved was a device

        var nodeIdTruncated = nodeId.substring(11);

        Devices.update(nodeIdTruncated, {$set:{parent:parentIdTruncated}});

    }

//    console.log(nodeId + " ---- " + nodeIdTruncated);


}

Template.groupsReactive.rendered = Template.groups.rendered = function() {

    $('ol.sortable').nestedSortable({
        forcePlaceholderSize: true,
        handle: 'div',
        helper:	'clone',
        items: 'li',
        opacity: .6,
        placeholder: 'placeholder',
        revert: 250,
        tabSize: 25,
        tolerance: 'pointer',
        toleranceElement: '> div',
        maxLevels: 5,
        changeCallback: groupOrderChanged,
        isAllowed: dragIsAllowed,
        isTree: true,
        expandOnHover: 700,
        startCollapsed: false
    });

    $('.disclose').on('click', function() {
        $(this).closest('li').toggleClass('mjs-nestedSortable-collapsed').toggleClass('mjs-nestedSortable-expanded');
    })

}

// returns true for success, false for failure
function attachChild(output, child)
{
    var ret = true;
    var childrenEntered = false; // set to true once we recurse into children
    for(var i in output)
    {
        if( output[i]._id == child.parent )
        {
            output[i].children.push(child);
            return true;
        }
        if( output[i].children.length != 0 )
        {
            childrenEntered = true;
            ret = ret && attachChild(output[i].children, child);
        }
    }
    return ret && childrenEntered; // if we haven't looked at any children, ret will be incorrectly set to false which the && prevents
}

// recursive function to crawl the nested groups with a DFS and assign unique id's for the dom
function numberChildUnique(output, number)
{
    // default value if not provided
    number = typeof number !== 'undefined' ? number : 1;

    var prefix = "list_";

    for(var i in output)
    {
        output[i].domId = prefix + number;
        number++;

        if( output[i].children.length != 0 )
        {
            number = numberChildUnique(output[i].children, number);
        }
    }

    return number;
}

function mergeDevicesGroups(devices,groups)
{
//    debugger;
    var output = [];
    for(var i in devices)
    {
        if(!devices[i].parent)
        {
            devices[i].parent = null;
        }

        devices[i].type = 'd';

        output.push(devices[i]);
    }

    for(var i in groups)
    {
        groups[i].type = 'g';

        output.push(groups[i]);
    }

    return output;
}

function buildHeirarchy(g)
{
    var worstCaseIterations = g.length + 1;
    var output = [];
    for (var i in g) {
        g[i].children = [];
    }

    // add all the top level parents
    for (var i in g) {
        var node = g[i];
        if( node.parent == null )
        {
            output.push(node);
            delete(g[i]); //delete node from input because we've successfully attached it
        }
    }


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
            var success = attachChild(output, node);

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

//    numberChildUnique(output);


    return output;
}


Template.groupsReactive.rowTypeIsGroup = Template.group.rowTypeIsGroup = Template.groups.rowTypeIsGroup = function(t)
{
    if( this.type === 'g' )
        return true;
    return false;
}


Template.groupsReactive.groups = Template.groups.groups = function()
{
    var flatGroups = Groups.find().fetch().reverse();

    var devices = Devices.find().fetch();

    var merged = mergeDevicesGroups(devices, flatGroups);

    return buildHeirarchy(merged);
}

Template.groupsReactive.groupsDebug = Template.groups.groupsDebug = function()
{
    return JSON.stringify(Template.groups.groups());
}

Template.groupsReactive.domID = Template.groups.domID = function()
{
    return _id;
}

fakeUserId = function()
{
    return "2zjj2CjuCa3mbx6zW";
}

settingsDocId = function()
{

    var s = Settings.findOne({userId:fakeUserId()});

    if(!s)
        return null;

    return s._id;
}

Template.fenceList.fenceList = function ()
{
    return Fences.find();
}

// returns first point, or center if circle
Template.fence.onePoint = function()
{
    console.log(this);

    var p = {lat:0,lng:0};

    if( this.layerType === "rectangle" || this.layerType === "polygon" )
    {
        p = this.layer._latlngs.first();
    }

    if( this.layerType === "circle" )
    {
        p = this.layer._latlng;
    }

    return p.lat + ', ' + p.lng;
}

Template.fence.deviceCount = function()
{
    var devices = this.devices;

    if( !devices )
        return 0;
    else
        return Object.keys(devices).length;
}
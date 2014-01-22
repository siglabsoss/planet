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


function mergeDevicesGroups(devices,groups)
{
    var output = [];
    for(var i in devices)
    {
        if(!devices[i].parents)
        {
            devices[i].parents = [];
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




Template.groupsSimple.rowTypeIsGroup = Template.groupsReactive.rowTypeIsGroup = Template.group.rowTypeIsGroup = Template.groups.rowTypeIsGroup = function(t)
{
    if( this.type === 'g' )
        return true;
    return false;
}


Template.groupsSimple.groups = Template.groupsReactive.groups = Template.groups.groups = function()
{
    var flatGroups = Groups.find().fetch().reverse();

    var devices = Devices.find().fetch();

    var merged = mergeDevicesGroups(devices, flatGroups);

    return buildDocumentHeirarchy(merged);
}

Template.groupsReactive.groupsDebug = Template.groups.groupsDebug = function()
{
    return JSON.stringify(Template.groups.groups());
}

Template.groupsReactive.domID = Template.groups.domID = function()
{
    return _id;
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

// This helps with finding rendered templates
// http://projectricochet.com/blog/meteor-js-performance#.UtTAs2RDvYc
logRenders = function() {
    _.each(Template, function (template, name) {
        var oldRender = template.rendered;
        var counter = 0;

        template.rendered = function () {
            console.log(name, "render count: ", ++counter);
            oldRender && oldRender.apply(this, arguments);
        };
    });
}
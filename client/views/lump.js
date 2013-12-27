//function dragIsAllowed(item, parent)
//{
//    console.log("dragis");
//}

groupOrderChanged = function(newParentId, nodeId)
{
    var namedParentId = newParentId;

    // print null
    if( newParentId == null )
        namedParentId = null;


    console.log(namedParentId + " is now parent of " + nodeId);

    var nodeIdTruncated = nodeId.substring(6); // these id's in the dom are prefixed by 'mongo_' so remove the first 6 chars
    var parentIdTruncated = newParentId?newParentId.substring(6):null;

    Groups.update(nodeIdTruncated, {$set:{parent:parentIdTruncated}});
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



Template.groupsReactive.groups = Template.groups.groups = function()
{
    var flat = Groups.find().fetch().reverse();
    return buildHeirarchy(flat);
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
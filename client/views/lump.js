//function dragIsAllowed(item, parent)
//{
//    console.log("dragis");
//}

Template.groups.rendered = function() {

    $('#sortable-groups').sortable({
        'items':'li',
        'placeholder':'sortable-placeholder',
        'nested':'ul',
        'maxlevels':3,
        'maxItems':[5,3,2]
    });

}

// returns true for success, false for failure
function attachChild(output, child)
{
    for(var i in output)
    {
        if( output[i]._id == child.parent )
        {
            output[i].children.push(child);
            return true;
        }
        if( output[i].children.length != 0 )
        {
            return attachChild(output[i].children, child);
        }
    }
    return false;
}

function buildHeirarchy(g)
{
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

    // running attachChild for every node is not guaranteed to work the first time
    do
    {
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


    return output;
}



Template.groups.groups = function()
{
    var flat = Groups.find().fetch();
    return buildHeirarchy(flat);
}

Template.groups.groupsDebug = function()
{
    return JSON.stringify(Template.groups.groups());
}
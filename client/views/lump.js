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
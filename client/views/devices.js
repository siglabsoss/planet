Template.devicePropertiesList.tableBody = function()
{
    var d = [];

    for(var i = 0; i < 100; i++ )
    {
        d.push(['Ben Morse',27,'JavaScript']);
        d.push(['Joel Brinton',30,'C++']);
    }

    return d;
}

Template.devicePropertiesList.rendered = function()
{
    // do something
}
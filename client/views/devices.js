Template.devicePropertiesList.tableBody = function()
{

    var devices = Devices.find().fetch();

    return devices;
}

Template.devicePropertiesList.rendered = function()
{
    // do something

    $('#devicePropertiesList').grid();
}
Template.eventList.events = function()
{
    return Events.find();
}

Template.event.niceName = function()
{
    var message = "";
    if(this.type === "deviceFence")
    {
        message = message + "Device " + this.event.deviceId;
        if(this.event.entered)
            message = message + " entered ";
        else
            message = message + " left ";

        message = message + "Fence " + this.event.fenceId;

        return message;
    }

    return "other event";

}
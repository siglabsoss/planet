simpleLog = function(message)
{
    Logs.insert({
        l:message,
        time:new Date().getTime()
    });
}
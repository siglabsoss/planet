// This handles incoming hooks, called directly by router
hookRouteAction = function () {

    // this is an

//              console.log(JSON.stringify(this.params));
//    console.log(this.request.body);

    console.log(JSON.stringify(this.request.body));

    parseHook(this.request.body);


    this.response.writeHead(200, {'Content-Type': 'text/html'});
    this.response.end('hook ok');

}

// this parses the hook and calls any processing that needs to occur
function parseHook(object)
{
    if( object && object.updates )
    {
        object.updates.each(function(row) {

            if( !(row && row.lat != "undefined" && row.lng != "undefined" && row.serial != "undefined"))
            {
                return; // next in .each() parlance
            }
//            var record = {};
//            record.lat = row.lat;
//            record.lon = row.lon;
//            record.serial = row.serial;
//            Devices.insert(record);



            Devices.upsert(
                {
                    // Selector
                    serial: row.serial
                },
                {
                    // Modifier
                    $set: {
                        lat: row.lat,
                        lng: row.lng,
                        serial: row.serial
                    }
                }
            );

//            simpleLog("Update device " + row.serial + " " + JSON.stringify(result));


        });

//        var deviceIds = [];
//        object.updates.each(function(row) {deviceIds.push(row._id)});
//
//        console.log(deviceIds);

        // call process fences in 1 ms
        asyncProcessFences(false);
    }
}
// This handles incoming hooks, called directly by router
hookRouteAction = function () {

    // this is an

//              console.log(JSON.stringify(this.params));
    console.log(this.request.body);

//    simpleLog(JSON.stringify(this.request.body));

    parseHook(this.request.body);


    this.response.writeHead(200, {'Content-Type': 'text/html'});
    this.response.end('hook ok');

}


function parseHook(object)
{
    if( object && object.updates )
    {
        object.updates.each(function(row) {
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
                        lon: row.lon,
                        serial: row.serial
                    }
                }
            );

            simpleLog("Update device " + row.serial);


        });
    }
}
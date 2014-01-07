closedJSTSGeomFromPoints = function(coords){
    var coordinates = [];
    for( var i in coords)
    {
        var co = coords[i];
        coordinates.push(new jsts.geom.Coordinate(co.lat, co.lng))

    }

    // close polygon
    coordinates.push(coordinates[0])

    geometryFactory = new jsts.geom.GeometryFactory();
    var shell = geometryFactory.createLinearRing(coordinates);
    var poly = geometryFactory.createPolygon(shell);
    return poly;
}

// returns a JSTS point.  note that we use lat and LNG
coordJSTS = function(center){
    var coord = new jsts.geom.Coordinate(center.lat, center.lng);
    var point = new jsts.geom.Point(coord);

    return point;
}


debugPrintJSTSPoints = function(poly){
    console.log("points: " + poly.shell.points.length);
    console.log(JSON.stringify(poly.shell.points));
}

// https://gist.github.com/clauswitt/1604972
// Converts numeric degrees to radians
if(typeof(Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }
}

// http://www.movable-type.co.uk/scripts/latlong.html
haversineDistanceKM = function(p1, p2)
{
    var lat1 = p1.lat;
    var lon1 = p1.lng;
    var lat2 = p2.lat;
    var lon2 = p2.lng;

//    console.log( lat1 + " " + lon1 + " " + lat2 + " " + lon2 + " ");

    var R = 6371; // radius of earth km
    var dLat = (lat2-lat1).toRad();
    var dLon = (lon2-lon1).toRad();
    var lat1 = lat1.toRad();
    var lat2 = lat2.toRad();

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    return d;
}


// this should always be called async
// this is a function that looks at an array of devices ids (or every device) and every fence and updates fence.devices property
// pass null to search every device (could be used for server startup)
// after (or as) this function changes Fences.devices, "fenceDevicesChanged" below registers events as devices enter/leave fences
processFences = function(deviceIds) {
    var fenceList = Fences.find().fetch();

    var deviceList = null;
    if( !deviceIds ) {
        deviceList = Devices.find().fetch();
    } else {
        deviceList = Devices.find({_id: {$in: deviceIds}}).fetch();
    }


    for( var i in fenceList ) {
        var f = fenceList[i];

        var type = f.layerType;
        var fenceObject = null;

        if( type === "rectangle" || type === "polygon" ) {
            fenceObject = closedJSTSGeomFromPoints(f.layer._latlngs);
        } // if rectangle or polygon

//        if( type === "circle" )
//        {
//            // do nothing, we don't need to build a JSTS object
//        }

        for( var j in deviceList ) {
            var d = deviceList[j];

            var deviceInside = null;

            if( type === "rectangle" || type === "polygon" ) {
                // this expects lat and LNG
                var pointObject = coordJSTS(d);

                deviceInside = pointObject.within(fenceObject);
            }

            if( type === "circle" ) {
                // dist is distance in meters
                var dist = haversineDistanceKM(d, f.layer._latlng) * 1000;

                // _mRadius is the radius of the circle in meters
                deviceInside = (dist <= f.layer._mRadius);
            }

            if( deviceInside != null ) {
                // run query
                if(deviceInside) {
                    Fences.update(f._id, {$addToSet:{'devices': d._id}})
                } else {
                    Fences.update(f._id, {$pull:{'devices': d._id}})
                }
            }
        } // for devices
    } // for fences
}









if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup



        var fenceDevicesChanged = Fences.find({});

        fenceDevicesChanged.observe({
            added: function(document) {
//                console.log('fence added');
                // don't care
            },
            changed: function(newDocument, oldDocument){

                var leaving = oldDocument.devices.subtract(newDocument.devices);

                console.log('leaving fence: ' + newDocument._id);
                console.log(leaving);

                var entering = newDocument.devices.subtract(oldDocument.devices);

                console.log('entering: ' + newDocument._id);
                console.log(entering);

//                console.log(JSON.stringify(oldDocument));
//                console.log(JSON.stringify(newDocument));

            },
            removed: function(oldDocument) {
//                console.log('fence removed');
            }
        });


    });
}
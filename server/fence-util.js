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

circleJSTS = function(center, radius){
    var coord = new jsts.geom.Coordinate(center.lat, center.lon);
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
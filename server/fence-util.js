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

// returns a JSTS point.  note that we use lat and LON
coordJSTS = function(center){
    var coord = new jsts.geom.Coordinate(center.lat, center.lon);
    var point = new jsts.geom.Point(coord);

    return point;
}


debugPrintJSTSPoints = function(poly){
    console.log("points: " + poly.shell.points.length);
    console.log(JSON.stringify(poly.shell.points));
}

Meteor.startup(function () {
    Meteor.methods({


        // debug
        debugFence : function()
        {
            var fenceList = Fences.find().fetch();
            var deviceList = Devices.find().fetch();

            console.log(' ');console.log(' ');

            for( var i in fenceList )
            {
                var f = fenceList[i];

//                console.log(f.layer.options);

                var type = f.layerType;
                var fenceObject = null;

                if( type === "rectangle" || type === "polygon" )
                {
//                    console.log(f.layer._latlngs);

                    fenceObject = closedJSTSGeomFromPoints(f.layer._latlngs);
                } // if rectangle or polygon

                if( type === "circle" )
                {
                    // do nothing, we don't need to build a JSTS object
                }

                    for( var j in deviceList )
                    {
                        var d = deviceList[j];



                        if( type === "rectangle" || type === "polygon" )
                        {

                            // this expects lat and LNG
                            var pointObject = coordJSTS(d);

                            if(pointObject.within(fenceObject))//result.covers(point)
                            {
                                console.log(d._id + " is inside " + f._id);
                            }
                            else
                            {
    //                            console.log('no');
                            }
                        }


                        if( type === "circle" )
                        {
                            // dist is distance in meters
                            var dist = haversineDistanceKM(d, f.layer._latlng) * 1000;

                            // _mRadius is the radius of the circle in meters
                            if( dist <= f.layer._mRadius )
                            {
                                console.log(d._id + " is inside " + f._id);
                            }
                        }
                    } // for devices

            } // for fences


        },


        pingServerTime : function(clientTime) {

            var time = Date.now();

//        console.log(time);
//        console.log(clientTime);

            return time;
        }


    });
});

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

                if( type === "rectangle" || type === "polygon" )
                {
//                    console.log(f.layer._latlngs);

                    var result = closedJSTSGeomFromPoints(f.layer._latlngs);


                    for( var j in deviceList )
                    {
                        var d = deviceList[j];

                        // this expects lat and LON
                        var point = coordJSTS(d);

                        if(point.within(result))//result.covers(point)
                        {
                            console.log(d._id + " is inside " + f._id);
                        }
                        else
                        {
//                            console.log('no');
                        }
                    } // for devices
                } // if rectangle or polygon
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

var devicesShaking = false;

var testDeviceCount = 100;

Meteor.startup(function () {
    Meteor.methods({

        generateTestDevices: function(){
            for (var i=1; i<testDeviceCount; i++){
                Devices.insert({lat:37.493316 + 0.1 * (-0.5 + Math.random()),
                                lng:-122.250366 + 0.1 * (-0.5 + Math.random()),
                                serial:i});
            }
        },



        shakeTestDevices: function(run){

            if( run && devicesShaking ) {
                return;
            }

            if( run ) {
                devicesShaking = true;
            } else {
                devicesShaking = false;
                return;
            }

            // simulation params

            var spawnPoint = {lat:37.774035,lng:-122.419281};
            var updateTimeInterval = 500;
            // rand must be below this to move a pin, 1 is full move
            var randomChance = 0.005;
            // random movement maximum in lat/lng coords
            var wanderDistance = 0.0033;


            var testFence = JSON.parse('[{"lat":37.70609673460725,"lng":-122.5191879272461},{"lat":37.8065289741725,"lng":-122.5191879272461},{"lat":37.8065289741725,"lng":-122.38494873046875},{"lat":37.70609673460725,"lng":-122.38494873046875}]');
            var fenceObject = closedJSTSGeomFromPoints(testFence);


            var shakeFunction;
            shakeFunction = function() {


                for (var i=1; i<testDeviceCount; i++){

                    if( Math.random() >= randomChance )
                        continue;

                    var device = Devices.findOne({serial: i});
                    var pointObject = coordJSTS(device);

                    // ok to pass null for 3rd param unless it's a circle (oh god)
                    var locationOk = deviceInsideFence("rectangle", device, null, fenceObject);

                    var query = null;

                    if( !locationOk ) {
                        // query to reset device
                        // spawnPoint is a ready-to-go object
                        query = {$set:
                            spawnPoint
                        };
                    } else {
                        // query to jiggle it
                        // this is one way to update devices, however I don't know if they are leaving the fence cuz these numbers are relative
                        query = {$inc: {
                            lat: wanderDistance * (-0.5 + Math.random()),
                            lng: wanderDistance * (-0.5 + Math.random())
                        }};
                    }

                    // run either query
                    Devices.update(device._id, query);
                }

                if( devicesShaking )
                {
                    Meteor.setTimeout(shakeFunction, updateTimeInterval);
                }

            };

            shakeFunction();
        },



        removeAllTestDevices: function(){
            Devices.remove({});
        },

        debugEmail: function(){
            debugSendEmail();
        },

        clearDebugLog: function()
        {
            Logs.remove({});
        },

        debugProcess : function()
        {
//            processFences(["Z9h84CmKHrSz3cdzY","ToKWvPTq8xYNNzN7P"]);
              processFences(false);
        },


        pingServerTime : function(clientTime) {

            var time = Date.now();

//        console.log(time);
//        console.log(clientTime);

            return time;
        },

        serverSideProcessFences : function(deviceIds) {
            asyncProcessFences(deviceIds);
        },

        updateUserObject : function(o) {

            // Client can just call
            // Meteor.users.update(Meteor.userId(), {$set:{'profile.user.firstName': 'Ben'}});
            if(o.firstName)
                Meteor.users.update({_id: this.userId }, {$set:{'profile.user.firstName': o.firstName}});

            if(o.lastName)
                Meteor.users.update({_id: this.userId }, {$set:{'profile.user.lastName': o.lastName}});

        }


    });
});
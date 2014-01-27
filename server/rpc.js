

Meteor.startup(function () {
    Meteor.methods({

        generateTestDevices: function(){

            var count = 5;

            for (var i=1; i<count; i++){
                Devices.insert({lat:37.493316 + 0.1 * (-0.5 + Math.random()),
                                lng:-122.250366 + 0.1 * (-0.5 + Math.random()),
                                serial:i});
            }

        },



        shakeTestDevices: function(){

            var updateTimeInterval = 1000;
            var stopShakeAfter = 20000;

            var shakeFunction = function() {


                var count = 5;

                for (var i=1; i<count; i++){
                    Devices.update(Devices.find({serial: i}).fetch()[0]._id, {$inc: {lat: 0.01 * (-0.5 + Math.random())}});
                    Devices.update(Devices.find({serial: i}).fetch()[0]._id, {$inc: {lng: 0.01 * (-0.5 + Math.random())}});
                }


            };

            var interval = Meteor.setInterval(shakeFunction, updateTimeInterval);

            var stopFunction = function() {
                   Meteor.clearInterval(interval);
            };

            Meteor.setTimeout(stopFunction, stopShakeAfter);
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
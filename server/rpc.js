
Meteor.startup(function () {
    Meteor.methods({

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
        }


    });
});
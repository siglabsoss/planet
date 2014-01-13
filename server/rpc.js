
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
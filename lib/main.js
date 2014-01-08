//https://www.eventedmind.com/feed/q8QWX5e7PTu8BEReY for the router specific episode
Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound',

    // default after
    after: function() {
        if( Meteor.isClient ) {
            showMainMap(false);
        }
    },
    yieldTemplates: {
        'mainMapAndLeft': {to: 'optionalMap'}
    }
});



Router.map(function(){
    this.route('emptyTemplate', {
     path: '/dashboard',
     after: function() {
         if( Meteor.isClient ) {
            showMainMap(true);
         }
     }
    });

    this.route('loggedOut', {
       path: '/'
    });

    this.route('groups', {
        path: '/groups'
    });

    this.route('groupsSimple', {
        path: '/groupsSimple'
    });

    this.route('groupsReactive', {
        path: '/groupsReactive'
    });

    this.route('devicePropertiesList', {
        path: '/deviceProperties'
    });

    this.route('debugBootstrap', {
        path: '/debugBootstrap'
    });

    this.route('fenceList', {
        path: '/fenceList'
    });

    this.route('eventList', {
        path: '/eventList'
    });

    this.route('alerts', {
        path: '/alerts'
    });


    this.route('debugLog', {
        path: '/log',
        data: {
            logs: function() {
                return Logs.find({},{sort:{time:1}});
            }
        }
    });

    if (Meteor.isServer) {
        this.route('webHookOk', {
            path: '/webhook',
            where: 'server',
            action: hookRouteAction // see webhook.js
        });
    }

});


if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
        console.log("PopWorld started");
    });
}


showMainMap = function(yes) {
    if(yes) {
        Session.set("shouldShowMainMap", true);
    } else {
        Session.set("shouldShowMainMap", false);
    }
}
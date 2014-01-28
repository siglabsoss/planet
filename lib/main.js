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


// This block makes it so that any links that have class iron-ignore will be ignored by the routers
// this is especially useful for jQuery links that have targets like # and #home
// The tabs on the fence/device popup bubbles make use of this
if (Meteor.isClient) {
    Template.layout.events({
        "click a.iron-ignore": function(e) {
            e.preventDefault();
        }
    });
}



Router.map(function(){
    this.route('emptyTemplate', {
     path: '/dashboard',
     after: function() {
         if( Meteor.isClient ) {
            showMainMap(true);
             leftPanelRerenderDependency.changed();
         }
     }
    });

    this.route('loggedOut', {
       path: '/',
       layoutTemplate: 'loggedOutLayout',
       yieldTemplates: null
    });

    this.route('groups', {
        path: '/groups'
    });

    this.route('userSettings', {
        path: '/settings'
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

    this.route('contacts', {
        path: '/contacts'
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

if(Meteor.isClient) {
    Deps.autorun(function(){
        if(!Meteor.user()) {
            flashAlertMessage("<a href='/'><h4>Not Logged in!</h4></a>", {
                hideAfter:4000,
                type: "danger"
            });
        }
    });
}
//https://www.eventedmind.com/feed/q8QWX5e7PTu8BEReY for the router specific episode
Router.configure({
    layout: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound'
});



Router.map(function(){
    this.route('dashboard', {
     path: '/dashboard'
    });

    this.route('loggedOut', {
       path: '/'
    });

    this.route('debugLog', {
        path: '/log',
        data: {
            logs: function() {
                return Logs.find({},{sort:{time:1}});
            }
        }
    });

    this.route('webHookOk', {
        path: '/webhook',
        where: 'server',
        action: function () {


//              console.log(JSON.stringify(this.params));
            console.log(this.request.body);

            this.response.writeHead(200, {'Content-Type': 'text/html'});
            this.response.end('hook ok');

        }
    });

});


if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
        console.log("works");
    });
}
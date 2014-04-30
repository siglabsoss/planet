// see http://stackoverflow.com/questions/12984637/is-there-a-post-createuser-hook-in-meteor-when-using-accounts-ui-package
Accounts.onCreateUser(function (options, user) {

    // We still want the default hook's 'profile' behavior.
    if (options.profile) {
        user.profile = options.profile;
    }


    // do pre-user creation stuff here
    if( !user.profile ) {
        user.profile = {};
    }

    if( !user.profile.map ) {
        user.profile.map = {};
    }

    if( !user.profile.map.view ) {
        user.profile.map.view = {};
    }

    // default to showing fences
    user.profile.map.view.showFences = true;

    // show pins in all groups by default
    if( !user.profile.map.view.visibleGroups ) {
        var groupIds = [];

        Groups.find().fetch().each(function(g){
            console.log(g);
            if(g._id) {
                groupIds.push(g._id);
            }
        });

        // also show ungrouped
        groupIds.push(ungroupedMagicGroup()._id);

        // apply to profile
        user.profile.map.view.visibleGroups = groupIds;
    }

    return user;
});
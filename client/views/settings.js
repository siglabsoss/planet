Template.userSettings.user = function() {
    return Meteor.user;
}

Template.userSettings.userName = function () {
    return Meteor.user().profile.user.firstName;
}
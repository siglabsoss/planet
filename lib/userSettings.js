function isArray(x) {
    return _.isArray(x) && !EJSON.isBinary(x);
}

// pulled from "LocalCollection._makeLookupFunction"
var dotNotationFetch = function (key) {
    var dotLocation = key.indexOf('.');
    var first, lookupRest, nextIsNumeric;
    if (dotLocation === -1) {
        first = key;
    } else {
        first = key.substr(0, dotLocation);
        var rest = key.substr(dotLocation + 1);
        lookupRest = dotNotationFetch(rest);
        // Is the next (perhaps final) piece numeric (ie, an array lookup?)
        nextIsNumeric = /^\d+(\.|$)/.test(rest);
    }

    return function (doc) {
        if (doc == null)  // null or undefined
            return [undefined];
        var firstLevel = doc[first];

        // We don't "branch" at the final level.
        if (!lookupRest)
            return [firstLevel];

        // It's an empty array, and we're not done: we won't find anything.
        if (isArray(firstLevel) && firstLevel.length === 0)
            return [undefined];

        // For each result at this level, finish the lookup on the rest of the key,
        // and return everything we find. Also, if the next result is a number,
        // don't branch here.
        //
        // Technically, in MongoDB, we should be able to handle the case where
        // objects have numeric keys, but Mongo doesn't actually handle this
        // consistently yet itself, see eg
        // https://jira.mongodb.org/browse/SERVER-2898
        // https://github.com/mongodb/mongo/blob/master/jstests/array_match2.js
        if (!isArray(firstLevel) || nextIsNumeric)
            firstLevel = [firstLevel];
        return Array.prototype.concat.apply([], _.map(firstLevel, lookupRest));
    };
};


// pass in a dot notation path, and retrieve it from Meteor.user().profile.xxx
getUserSetting = function(path, options) {
    if (typeof path !== "string") {
        console.log("this function only accepts a string for the first param");
        return null;
    }
    var fullPath = 'profile.' + path;

    var dotNotationFetchFunction = dotNotationFetch(fullPath);

    var userObject;
    if( options )
        userObject = Meteor.users.find(Meteor.userId(), options);
    else
        userObject = Meteor.user();

    var value = dotNotationFetchFunction(userObject);

    // strip off outer array
    return value.first();
}

// pass in a dot notation path and value, and set it as Meteor.user().profile.xxx
setUserSetting = function(path, value) {
    if (typeof path !== "string") {
        console.log("this function only accepts a string for the first param");
        return false;
    }
    var fullPath = 'profile.' + path;

    var selector = {$set:{}};
    selector['$set'][fullPath] = value;

    Meteor.users.update(Meteor.userId(), selector);

    return true;
}

// Calles $unset on the path.  calling getUserSetting will return undefined after this
deleteUserSetting = function(path) {
    if (typeof path !== "string") {
        console.log("this function only accepts a string for the first param");
        return false;
    }
    var fullPath = 'profile.' + path;

    var selector = {$unset:{}};
    selector['$unset'][fullPath] = 1;

    Meteor.users.update(Meteor.userId(), selector);

    return true;
}

removeFromSetUserSetting = function(path, value) {
    if (typeof path !== "string") {
        console.log("this function only accepts a string for the first param");
        return false;
    }
    var fullPath = 'profile.' + path;

    var selector = {$pull:{}};
    selector['$pull'][fullPath] = value;

    Meteor.users.update(Meteor.userId(), selector);

    return true;
}

addToSetUserSetting = function(path, value) {
    if (typeof path !== "string") {
        console.log("this function only accepts a string for the first param");
        return false;
    }
    var fullPath = 'profile.' + path;

    var selector = {$addToSet:{}};
    selector['$addToSet'][fullPath] = value;

    Meteor.users.update(Meteor.userId(), selector);

    return true;
}
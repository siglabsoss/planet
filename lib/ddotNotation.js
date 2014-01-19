(function (window) {

    function isArray(x) {
        return _.isArray(x) && !EJSON.isBinary(x);
    }

// pulled from "LocalCollection._makeLookupFunction" ...

    // _makeLookupFunction(key) returns a lookup function.
    //
    // A lookup function takes in a document and returns an array of matching
    // values.  This array has more than one element if any segment of the key other
    // than the last one is an array.  ie, any arrays found when doing non-final
    // lookups result in this function 'branching'; each element in the returned
    // array represents the value found at this branch. If any branch doesn't have a
    // final value for the full key, its element in the returned list will be
    // undefined. It always returns a non-empty array.
    //
    // _makeLookupFunction('a.x')({a: {x: 1}}) returns [1]
    // _makeLookupFunction('a.x')({a: {x: [1]}}) returns [[1]]
    // _makeLookupFunction('a.x')({a: 5})  returns [undefined]
    // _makeLookupFunction('a.x')({a: [{x: 1},
    //                                 {x: [2]},
    //                                 {y: 3}]})
    //   returns [1, [2], undefined]

    function _makeLookupFunction(key) {
        var dotLocation = key.indexOf('.');
        var first, lookupRest, nextIsNumeric;
        if (dotLocation === -1) {
            first = key;
        } else {
            first = key.substr(0, dotLocation);
            var rest = key.substr(dotLocation + 1);
            lookupRest = _makeLookupFunction(rest);
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


    function constructor() {

        function newLookup(key) {
            var result = {};

            if( typeof key === "undefined" || key === null ) {
                result.lookupFunction = function(throwaway){return [key]};
            } else {
                result.lookupFunction = _makeLookupFunction(key);
            }
            result.fetch = function(object) {
                // read the comment for _makeLookupFunction.
                // we frankly aren't intersted in this behaviour so always pull the first one
                // this with both unify results, and hide if there are any errors
                return result.lookupFunction(object).first();
            }

            return result;
        }

        var publicInterface = {
            // returns a LookupFunction
            match: function(key) {
                return newLookup(key);
            }

        };

        return publicInterface;
    }

    window.DDot = constructor();

}((Meteor && Meteor.isServer)?global:window));
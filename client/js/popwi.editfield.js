(function (window) {

    // this is a constructor but not named that for clarity with what is about to go down
    function popEditFieldRunOnce() {

        /**
         * Creates a new class
         *
         * @param superClass
         * @param methods
         */
        function clazz(SuperClass, methods) {
            var constructor = function () {};
            constructor.prototype = new SuperClass;
            constructor.prototype.constructor = constructor;
            constructor.prototype.parent = SuperClass.prototype;
            constructor.prototype = $.extend(constructor.prototype, methods);
            return constructor;
        }




        // Above here is helper methods
        // Below here is executed code

        // List of classes
        var PopAbstractInputOptions, PopTextInput, PopMultiInput, PopSingleInput, PopInputHandle;

        PopInputHandle = clazz(Object, {});


        PopAbstractInputOptions = clazz(Object, {

            select2options: {
                multiple: false,
    //            placeholder: "Placeholder",$selector.attr('data-placeholder-text'),
                width: '100%',

                // when the user types
                query: function (query) {

//                    // build regex to find text anywhere in field
//                    var expression = ".*"+query.term+".*";
//                    var rx = RegExp(expression,'i');
//
//                    // search mongo
//                    var documents = collection.find({name:rx}).fetch();
//
//                    // callback is expecting a results member
//                    var data = {
//                        results: convertDocumentsSelect2(documents)
//                    };

//                    query.callback(data);
                },
                initSelection: function(element, callback) {
//                    // don't care what element is bc we already know
//
//                    var initialSelection = [];
//
//                    var fetchedValue = DDot.match(dotNotationString).fetch(data);
//
//                    if( isDotNotation && data && fetchedValue ) {
//                        initialSelection = collection.find({name: fetchedValue}).fetch();
//
//                        // callback is just expecting an array
//                        callback(convertDocumentsSelect2(initialSelection).first());
//                    } else {
//                        if( data && data[fieldName] && Array.isArray(data[fieldName]) ) {
//                            initialSelection = collection.find({_id: {$in: data[fieldName]}}).fetch();
//
//                            // callback is just expecting an array
//                            callback(convertDocumentsSelect2(initialSelection));
//                        }
//                    }
                }
            } //select2options
            ,init: function(selectorIn) {
                this.selector = selectorIn;
                this.initJQueryElement();
            }
            ,editAlertFormPendingChanges:[]
            ,info: function() {
                console.log("information");
            }
            ,initJQueryElement: function() {
                this.$selector = $(this.selector);
            }
            ,$selector: null
            ,selector: null
        });

        PopMultiInput = clazz(PopAbstractInputOptions, {
            init:function(selector) {
                this.parent.init(selector);

                this.select2options.multi = true;


            },
            abss: function() {
                return "PopMultiInput"
            }
        });

        function getPopMultiInput(selector) {

            var instance = new PopMultiInput(); // this returns something that says "constructor" in the console, but really it's just a malloc'd object
            instance.init(selector); // this is the real constructor


            return instance;
        }



        var publicInterface = {
            // returns a LookupFunction
            match: function(key) {
                return newLookup(key);
            }
            ,multiInput: getPopMultiInput
//            ,"class": {
//                "text": PopTextInput,
//                "multi": PopMultiInput,
//                "abstract": PopAbstractInput
//            }

        };

        return publicInterface;
    }

    window.PopEditField = popEditFieldRunOnce();

}((Meteor && Meteor.isServer)?global:window));
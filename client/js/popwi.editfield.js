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
            SuperClass.child = constructor.prototype;
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
                width: '100%'
            }
            ,init: function(selectorIn, child) {
                this.selector = selectorIn;
                this.initJQueryElement();
            }
            ,dataPendingChanges:[]
            ,initJQueryElement: function() {
                this.$selector = $(this.selector);
            }
            ,$selector: null
            ,selector: null
        });

        PopMultiInput = clazz(PopAbstractInputOptions, {
            init:function(selector, child) {

                this.parent.init(selector, child);

                var self = child;
                console.log('Child init/build');



                self.select2options.multiple = true;

                // if true, we are selecting a single thing from a member on us via dot notation
                self.isDotNotation = false;
                self.dotNotationString = self.$selector.attr('data-dot-notation');
                if( self.dotNotationString && typeof self.dotNotationString === "string" ) {
                    self.isDotNotation = true;
                }


                self.select2options.initSelection = function(element, callback) {
                    // don't care what element is bc we already know

                    var initialSelection = [];

                    var fetchedValue = DDot.match(self.dotNotationString).fetch(self.data);

                    if( self.isDotNotation && self.data && fetchedValue ) {
                        initialSelection = self.searchedCollection.find({name: fetchedValue}).fetch();

                        // callback is just expecting an array
                        callback(convertDocumentsSelect2(initialSelection).first());
                    } else {
                        if( self.data && self.data[self.fieldName] && Array.isArray(self.data[self.fieldName]) ) {
                            initialSelection = self.searchedCollection.find({_id: {$in: self.data[self.fieldName]}}).fetch();

                            // callback is just expecting an array
                            callback(convertDocumentsSelect2(initialSelection));
                        }
                    }
                };

                self.select2options.query = function(query) {  // when the user types

                    // build regex to find text anywhere in field
                    var expression = ".*"+query.term+".*";
                    var rx = RegExp(expression,'i');

                    // search mongo
                    var documents = self.searchedCollection.find({name:rx}).fetch();

                    // callback is expecting a results member
                    var data = {
                        results: convertDocumentsSelect2(documents)
                    };

                    query.callback(data);
                };









                // build select2
                self.$selector.select2(self.select2options);



                if( self.isDotNotation ) {
                    // Still a bit confused about this
                    self.$selector.select2("val", {id:self.data._id});
                } else {
                    // WHAT IS WRONG? we need this line, but it has no data.  The data came from initSelection()
                    self.$selector.select2("val", []);
                }

                // bind change
                self.$selector.on("change", function(e) {
                    // here e has a lot of stuff in it. including e.val which is an array of the full set
                    // we only deal in deltas tho

                    if( self.isDotNotation ) {
                        if( e && e.type && e.type === "change" && e.added && e.added.id ) {

                            // push change made by user into a queue which we can execute later when they press 'save'
                            self.dataPendingChanges.push(function(){


                                var value = self.searchedCollection.findOne(e.added.id);

                                if( value && value.name ) {

                                    // set it by name
                                    var query = {$set:{}};
                                    query.$set[self.dotNotationString] = value.name;
                                    self.editingCollection.update(data._id, query);
                                }
                            });
                        }
                    } else {

                        if( e && e.added && e.added.id ) {

                            // push change made by user into a queue which we can execute later when they press 'save'
                            self.dataPendingChanges.push(function(){
                                var query = {$addToSet:{}};
                                query.$addToSet[self.fieldName] = e.added.id;
                                self.editingCollection.update(data._id, query);
                            });
                        }

                        if( e && e.removed && e.removed.id ) {

                            // push change made by user into a queue which we can execute later when they press 'save'
                            self.dataPendingChanges.push(function(){
                                var query = {$pull:{}};
                                query.$pull[self.fieldName] = e.removed.id;
                                self.editingCollection.update(data._id, query);
                            });
                        }
                    }
                });



            },
            abss: function() {
                return "PopMultiInput"
            }
        });



        var publicInterface = {
            // returns a LookupFunction
            match: function(key) {
                return newLookup(key);
            }
            ,MultiInput: function(selector, optionsIn) {

                var userOptions = (optionsIn)?optionsIn:{};

                // NOTE: Javascript inheritance and prototypes
                // Because we are using clazz (Which I think is really cool), we must manually overide the init() at each level of inheritance, and manually call this.parent.init()
                // With each call of init, the this variable loses inheritance of the childs members.  This really sucks because we build functionality into parents that rely on members
                // that will exist in the child which breaks stuff.
                // So the best thing I could think was to pass the self of the most inherited object up the stack.  works great after hours of thinking lol

                // simple (or maybe not?) way to mix in additional user options, (clazz does extend for us)
                userOptions.init = function(selector){
                    this.parent.init(selector, this);
                };

                var YourClass = clazz(PopMultiInput, userOptions);

                var instance = new YourClass(); // this returns something that says "constructor" in the console, but really it's just a malloc'd object
                instance.init(selector); // this is the real constructor


                return instance;
            }
        };

        return publicInterface;
    }

    window.PopEditField = popEditFieldRunOnce();

}((Meteor && Meteor.isServer)?global:window));
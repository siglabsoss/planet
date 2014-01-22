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
        var PopAbstractInputOptions, PopTextInput, PopMultiInput, PopSingleInput;


        PopAbstractInputOptions = clazz(Object, {

            init: function(selectorIn, child) {
                child.selector = selectorIn;
                child.initJQueryElement();
            }
            ,dataPendingChanges:[]
            ,initJQueryElement: function() {
                this.$selector = $(this.selector);
            }
            ,$selector: null
            ,selector: null
        });

        PopMultiInput = clazz(PopAbstractInputOptions, {
            select2options: {
                multiple: false,
                width: '100%'
            }
            // finalizes options which are hard to set with $.extend
            // this should not call parent
            ,finalizeOptions:function(child) {
                child.select2options.multiple = true;
            }
            ,init:function(selector, child) {

                this.parent.init(selector, child);

                var self = child;
//                console.log('Child init/build');

                self.select2options.placeholder = self.$selector.attr('data-placeholder-text');

                // if true, we are selecting a single thing from a member on us via dot notation
                self.isDotNotation = false;
//                self.dotNotationString = self.$selector.attr('data-dot-notation');
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
                                    self.editingCollection.update(self.data._id, query);
                                }
                            });
                        }
                    } else {

                        if( e && e.added && e.added.id ) {

                            // push change made by user into a queue which we can execute later when they press 'save'
                            self.dataPendingChanges.push(function(){
                                var query = {$addToSet:{}};
                                query.$addToSet[self.fieldName] = e.added.id;
                                self.editingCollection.update(self.data._id, query);
                            });
                        }

                        if( e && e.removed && e.removed.id ) {

                            // push change made by user into a queue which we can execute later when they press 'save'
                            self.dataPendingChanges.push(function(){
                                var query = {$pull:{}};
                                query.$pull[self.fieldName] = e.removed.id;
                                self.editingCollection.update(self.data._id, query);
                            });
                        }
                    }
                });



            }
            ,getChanges: function() {
                return this.dataPendingChanges;
            }
            ,discardChanges: function() {
                this.dataPendingChanges = null;
            }
            ,saveChanges: function() {
                var self = this;
                // all the saved changes to the select2 are built into a function, and added to a list of pending changes
                if( self.dataPendingChanges && Array.isArray(self.dataPendingChanges) ) {

                    self.dataPendingChanges.each(function(fn){
                        if( typeof fn === "function" ) {
                            // call the single change, in the list of changes that the user made to the select2
                            fn();
                        } // if
                    }); // each functions
                } // if
            }
            ,destroy: function() {
                var self;
                if( arguments.length === 0 ) {
                    self = this;
                } else {
                    self = arguments[0];
                }

                self.discardChanges();

                if( self.$selector ) {
                    self.$selector.select2("destroy");
                }

                // mark stuff for garbage collection
                self.select2options = null;
                self.$selector = null;
                self.selector = null;
            }
        });



        // almost identical to PopMultiInput, just using a different finalizeOptions() function
        PopSingleInput = clazz(PopMultiInput, {
            // finalizes options which are hard to set with $.extend
            // this should not call parent
            finalizeOptions:function(child) {
                child.select2options.multiple = false;
            }
            ,init:function(selector, child) {
                this.parent.init(selector, child);
            }
            ,destroy: function() {
                // destroy also needs to pass child up chain to avoid modifying our virgin SingleInput, MultiInput, and PopAbstractInputOptions classes
                var self;
                if( arguments.length === 0 ) {
                    self = this;
                } else {
                    self = arguments[0];
                }

                this.parent.destroy(self);
            }
        });

        PopTextInput = clazz(PopAbstractInputOptions, {
            bootstrapEditableOptions: {
                title: 'Enter value' // default placeholder
            }
            ,finalizeOptions:function(child){
            }
            ,init:function(selector, child) {
                this.parent.init(selector, child);

                var self = child;


                // look at the html from the temlpate to see if it has this attr
                var inputClass = self.$selector.attr('data-has-class');
                if( inputClass && typeof inputClass === "string")
                {
                    // if so we want to set this option for the edit in place
                    self.bootstrapEditableOptions.inputclass = inputClass; // notice caps
                }

                self.bootstrapEditableOptions.placeholder = self.$selector.attr('data-placeholder-text');

                // called when the bootstrap-editable submit() function is called
                self.bootstrapEditableOptions.success = function(response, newValue) {

                    // success callback gets called with this set to the span.  However we can use a few references to find the <input> tag
                    var $span = $(this);

                    // this is different than self.$selector
                    var $input = this.data('editable').input.$input;

                    // build query to update the specific field
                    var query = {$set:{}};
                    query.$set[self.fieldName] = $input.val();

                    // Update model
                    self.editingCollection.update(self.data._id, query);

                    return true;
                }


                // create and bind
                self.$selector.editable(self.bootstrapEditableOptions);

                // activate
                self.$selector.editable('show');

                // Now that we've shown it, we can do this if we want
                //   $selector.data('editable').input.$input.val()  or .addClass() or whatever
            }
            ,saveChanges: function() {
                this.$selector.editable('submit');
            }
            ,destroy: function() {
                // destroying causes too much head-ache because calling submit() then destroy() will call bootstrapEditableOptions.success() after destroy which messes shit up
            }
        });



        var publicInterface = {
            MultiInput: function(selector, optionsIn) {

                var userOptions = (optionsIn)?optionsIn:{};

                // NOTE: Javascript inheritance and prototypes
                // Because we are using clazz (Which I think is really cool), we must manually override the init() at each level of inheritance, and manually call this.parent.init()
                // With each call of parent.init, the 'this' variable loses inheritance of the members attached to the child.  This really sucks because we build functionality into parents that rely on members
                // that will exist in the child which breaks stuff.
                // So the best thing I could think was to pass the self of the most inherited object up the stack.  works great after hours of thinking lol

                // simple (or maybe not?) way to mix in additional user options, (clazz does extend for us)
                userOptions.init = function(selector){
                    this.parent.init(selector, this);
                };

                var YourClass = clazz(PopMultiInput, userOptions);

                var instance = new YourClass(); // this returns something that says "constructor" in the console, but really it's just a malloc'd object

                instance.parent.finalizeOptions(instance);
                instance.init(selector); // this is the real constructor


                return instance;
            },
            SingleInput: function(selector, optionsIn) {
                var userOptions = (optionsIn)?optionsIn:{};

                userOptions.init = function(selector){
                    this.parent.init(selector, this);
                };

                var YourClass = clazz(PopSingleInput, userOptions);

                var instance = new YourClass(); // this returns something that says "constructor" in the console, but really it's just a malloc'd object

                instance.parent.finalizeOptions(instance);
                instance.init(selector); // this is the real constructor

                return instance;
            },
            TextInput: function(selector, optionsIn) {
                var userOptions = (optionsIn)?optionsIn:{};

                userOptions.init = function(selector){
                    this.parent.init(selector, this);
                };

                var YourClass = clazz(PopTextInput, userOptions);

                var instance = new YourClass(); // this returns something that says "constructor" in the console, but really it's just a malloc'd object

                instance.parent.finalizeOptions(instance);
                instance.init(selector); // this is the real constructor

                return instance;
            }
        };

        return publicInterface;
    }

    window.PopEditField = popEditFieldRunOnce();

}((Meteor && Meteor.isServer)?global:window));
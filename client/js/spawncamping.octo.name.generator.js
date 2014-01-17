
(function (window) {

    var wordSets = [];

    // --- Default wordSet ---
    // these initially came from http://www.dack.com/web/bullshit.html
    wordSets['default'] = {};
    wordSets['default']['verbs'] = [
        "implement", "utilize", "integrate", "streamline", "optimize", "evolve", "transform", "embrace",
        "enable", "orchestrate", "leverage", "reinvent", "aggregate", "architect", "enhance", "incentivize", "morph", "empower",
        "envisioneer", "monetize", "harness", "facilitate", "seize", "disintermediate", "synergize", "strategize", "deploy",
        "brand", "grow", "target", "syndicate", "synthesize", "deliver", "mesh", "incubate", "engage", "maximize", "benchmark",
        "expedite", "reintermediate", "whiteboard", "visualize", "repurpose", "innovate", "scale", "unleash", "drive", "extend",
        "engineer", "revolutionize", "generate", "exploit", "transition", "e-enable", "iterate", "cultivate", "matrix",
        "productize", "redefine",
        "recontextualize"
    ];

    wordSets['default']['adjectives'] = [
        "clicks-and-mortar", "value-added", "vertical", "proactive", "robust", "revolutionary", "scalable",
        "leading-edge", "innovative", "intuitive", "strategic", "e-business", "mission-critical", "sticky", "one-to-one",
        "end-to-end", "global", "B2B", "B2C", "granular", "frictionless", "virtual", "viral", "dynamic",
        "best-of-breed", "killer", "magnetic", "bleeding-edge", "web-enabled", "interactive", "dot-com", "sexy", "back-end",
        "real-time", "efficient", "front-end", "distributed", "seamless", "extensible", "turn-key", "world-class",
        "open-source", "cross-platform", "cross-media", "synergistic", "bricks-and-clicks", "out-of-the-box", "enterprise",
        "integrated", "impactful", "wireless", "transparent", "next-generation", "cutting-edge", "user-centric", "visionary",
        "customized", "ubiquitous", "plug-and-play", "collaborative", "compelling", "holistic", "rich"
    ];

    wordSets['default']['nouns'] = [
        "synergies", "web-readiness", "paradigms", "markets", "partnerships", "infrastructures", "platforms",
        "initiatives", "channels", "eyeballs", "communities", "ROI", "solutions", "e-tailers", "e-services", "action-items",
        "portals", "niches", "technologies", "content", "vortals", "supply-chains", "convergence", "relationships",
        "architectures", "interfaces", "e-markets", "e-commerce", "systems", "bandwidth", "infomediaries", "models",
        "mindshare", "deliverables", "users", "schemas", "networks", "applications", "metrics", "e-business", "functionalities",
        "experiences", "web services", "methodologies"
    ];

    // --- Industrial wordSet ---
    wordSets['industrial'] = {};
    wordSets['industrial']['verbs'] = [
        "implement", "integrate", "squelch", "weld", "power-coat", "print", "cut", "press", "dry", "cure", "drill", "sand", "polish",
        "scratch", "injure", "tare", "weigh", "ship", "machine", "shave", "build", "demolish", "wheel", "move", "plug", "unplug", "smelt",
        "vacuum", "fix", "break", "carve", "collect", "make", "construct"
    ];

    wordSets['industrial']['adjectives'] = [
        "rusty", "sharp", "dull", "flaming", "smoldering", "rough", "smooth", "light", "heavy", "wet", "dry", "dusty", "clean", "metal",
        "plastic", "grooved", "pitted", "empty", "full", "wooden", "polished", "dull", "shiny", "reflective", "transparent", "smoking",
        "hot", "pressed", "rubberized", "plasticised", "level", "circular", "square", "dark", "crosscut", "cone-shaped", "keyless",
        "super", "super-duty", "fine", "fine-cut", "deluxe", "micro", "macro", "nailed", "3-speed", "buffed", "flush", "turbo",
        "high-speed", "diamond", "powered", "threaded", "random"
    ];

    wordSets['industrial']['nouns'] = [
        "lacquer", "slag", "drill", "table-saw", "jig-saw", "saw", "rubber", "plastic", "wood", "metal", "table", "chair", "window",
        "house", "building", "vehicle", "circle", "square", "level", "mahogany", "birch", "pine", "cedar", "cypress", "douglas-fir",
        "larch", "red-pine", "spruce", "aspen", "balsa", "boxwood", "cherry", "corkwood", "elm", "eucalyptus", "hickory", "maple", "oak",
        "router", "hand-tool", "power-tool", "bandsaw", "lathe", "cabinet-saw", "grinder", "air-compressor", "fence", "chuck",
        "drill-chuck", "jig", "nail", "screw", "sander", "disc-sander", "resin", "coating", "thread", "disc", "handpiece", "dust",
        "sawdust", "shavings"
    ];

    // --- Geo wordSet ---
    wordSets['geo'] = {};
    wordSets['geo']['verbs'] = [
        "travel", "bike", "drop-off", "check-in", "check-out", "pick-up", "take-off", "land", "ride", "fly", "analyze", "announce",
        "assist", "assure", "attempt", "attract", "cross", "bathe", "breath", "belong", "boil", "boast", "borrow", "bounce", "broadcast",
        "bump", "challenge", "change", "clarify", "clean", "collect", "connect", "confuse", "continue", "convert", "copy", "cost", "count",
        "cover", "crack", "crawl", "creep", "cycle", "decorate", "demonstrate", "detail", "design", "diagnose", "dig", "disappear",
        "discover", "dive", "divide", "double", "draft", "drag", "drain", "drive", "encourage", "estimate", "extract", "feed", "fetch",
        "film", "flash", "fold", "force", "forgo", "form", "formulate", "gather", "fry", "go", "guide", "haunt", "hum", "hug", "identify",
        "ignore", "increase", "inform", "invent", "job", "jump", "laugh", "launch", "lean", "lead", "level", "lick", "locate", "maintain",
        "map", "mark", "match", "measure", "meet", "melt", "memorize", "mentor", "mix", "move", "negotiate", "notice", "number", "obtain",
        "occur", "organize", "overdo", "overflow", "overthrow", "paint", "pass", "pause", "persuade", "photograph", "place", "plant",
        "plug", "poke", "polish", "posses", "pour", "predict", "process", "procure", "prove", "provide", "publicize", "pull", "pump",
        "push", "race", "reduce", "regulate", "relax", "rescue", "restore", "ride", "rinse", "sail", "scare", "scream", "see", "seek",
        "sell", "send", "sew", "settle", "shape", "shake", "show", "shrink", "shut", "signal", "sink", "sketch", "smell", "snatch",
        "soak", "spend", "spin", "split", "stain", "squeeze", "stare", "stop", "stroke", "supervise", "swim", "take", "tame", "tap",
        "teach", "thank", "thrust", "tie", "tip", "train", "trot", "thrust", "tug", "type", "update", "use", "vanish", "walk", "wander",
        "wash", "wave", "yawn", "yell", "zip", "zoom"
    ];

    wordSets['geo']['adjectives'] = [
        "local", "hyper-local", "beautiful", "majestic", "cold", "hot", "mild", "snowing", "icy", "late", "delayed", "warm", "misty",
        "plush", "silky", "smooth", "sandy", "silty", "organic", "spicy", "salty", "soupy", "wet", "dry", "short", "tall", "wide",
        "large", "small", "titan", "gargantuan", "giant", "massive", "colossal", "mighty", "global", "risky", "safe", "dangerous",
        "aboard", "abnormal", "abrupt", "acrid", "afraid", "alert", "alive", "aloof", "alluring", "animated", "annoyed", "anxious",
        "aquatic", "awake", "aware", "best", "better", "bitter", "black", "blue", "red", "orange", "yellow", "green", "indigo",
        "violet", "bouncy", "breezy", "bumpy", "bustling", "calm", "careful", "careless", "caring", "cheap", "charming", "chilly",
        "chubby", "classy", "clean", "clear", "clever", "cloistered", "cloudy", "closed", "clumsy", "comfortable", "common", "complete",
        "complex", "concerned", "cool", "cooperative", "crazy", "crooked", "cooked", "crowded", "cultured", "curious", "deep",
        "defective", "delightful", "descriptive", "didactic", "different", "diligent", "dirty", "dull", "dusty", "dynamic", "eager",
        "early", "earthy", "easy", "educated", "elastic", "elite", "empty", "entertaining", "envious", "equal", "ethereal",
        "ephemeral", "excellent", "exciting", "excited", "expensive", "faded", "famous", "fancy", "far", "fast", "female", "male",
        "fine", "fixed", "flat", "fluffy", "foamy", "free", "freezing", "furry", "glib", "good", "goofy", "grey", "grumpy",
        "healthy", "historical", "holistic", "hollow", "imaginary", "imperfect", "important", "imported", "innocent", "itchy",
        "jolly", "late", "lean", "likeable", "loud", "low", "lucky", "lush", "manly", "marked", "meek", "messy", "mixed",
        "moldy", "native", "natural", "neutral", "new", "nice", "noisy", "noiseless", "normal", "nutty", "odd", "old",
        "old-fashioned", "oval", "past", "peaceful", "pink", "plain", "polite", "political", "pricey", "private",
        "proud", "public", "puffy", "quick", "rainy", "rapid", "rare", "real", "rich", "regular", "ripe", "roomy", "savory", "scarce",
        "second", "shallow", "slick", "soft", "solid", "sour", "sparkling", "spiffy", "steep", "sticky", "stiff", "stormy",
        "super", "sweet", "tacky", "talented", "tan", "tart", "tasteful", "tasteless", "teeny-tiny", "tested", "think",
        "tidy", "tough", "tricky", "truthful", "unnatural", "unused", "unusual", "upbeat", "vigorous", "wacky", "wasteful",
        "weary", "wild", "wise", "wooden", "yielding", "yummy", "zippy", "cute", "damp", "womanly"
    ];

    wordSets['geo']['nouns'] = [
        "hut", "shack", "hotel", "fence", "country", "peninsula", "destination", "water", "air", "meal", "foot", "restaurant",
        "spices", "texture", "moisture", "fragrance", "chef", "appetite", "state", "county", "country", "Asia", "Africa", "Antarctica",
        "America", "Australia", "actor",
        "airplane", "airport", "alarm", "angle", "animal", "ant", "apple", "arm", "baby", "badge", "bag", "balloon", "ball",
        "baseball", "basket", "bottle", "bear", "bedroom", "beetle", "boat", "body", "bone", "book", "boot", "shoe", "border",
        "bottle", "boundary", "box", "brain", "branch", "breakfast", "brick", "bubble", "bulb", "butter", "cable", "cactus",
        "cake", "calculator", "calendar", "camera", "camp", "can", "carriage", "cat", "cattle", "cellar", "chair", "cheese",
        "cherries", "chess", "chicken", "clock", "coach", "coal", "computer", "corn", "cow", "cracker", "crayon", "crow", "cub",
        "cup", "", "dime", "dinner", "dinosaur", "dart", "dirt", "dog", "door", "donkey", "drain", "dress", "duck", "ear",
        "earthquake", "egg", "elbow", "expert", "face", "fairy", "farmer", "faucet", "foot", "fish", "flag", "flame", "flock",
        "floor", "fowl", "frog", "game", "garden", "gate", "glue", "journey", "goldfish", "grape", "grass", "hair", "hat",
        "head", "hill", "hole", "honey", "horse", "house", "ice", "insect", "iron", "jam", "jar", "jellyfish", "kite", "kitten",
        "knee", "ladybug", "leg", "letter", "line", "liquid", "lizard", "lock", "machine", "magic", "meat", "memory", "mice",
        "milk", "mint", "minute", "hour", "day", "month", "year", "century", "fortnight", "mouth", "muscle", "music", "neck",
        "nest", "noise", "nose", "notebook", "ocean", "office", "oil", "oven", "owl", "pancake", "paper", "pencil", "park",
        "peace", "pen", "pickle", "picture", "pie", "pig", "goat", "plot", "plough", "popcorn", "potato", "quarter", "quartz",
        "rabbit", "rail", "river", "rock", "roof", "room", "root", "stream", "scarf", "school", "scissors", "screw", "sea",
        "seashore", "seed", "sheep", "ship", "shirt", "skirt", "slope", "snail", "sock", "soda", "spider", "spoon", "squirrel",
        "steam", "steel", "stew", "stomach", "stone", "store", "stranger", "street", "stretch", "string", "structure", "sugar",
        "sun", "summer", "sun", "teeth", "tent", "texture", "thing", "thumb", "tooth", "toy", "train", "trail", "tree", "trip",
        "truck", "tub", "twig", "vacation", "vegetable", "vest", "volcano", "mountain", "voyage", "water", "waves", "wax",
        "weather", "wheel", "wind", "window", "winter", "wool", "work", "yak", "yam", "yard", "yarn", "zebra", "zoo"
    ];


    function constructor() {

        var defaultOptions = {
            wordSet: 'default',
            wordTypes: [
                'verbs',
                'adjectives',
                'nouns']
        };

//        function extend (target, source) {
//            target = target || {};
//            for (var prop in source) {
//                if (typeof source[prop] === 'object') {
//                    target[prop] = extend(target[prop], source[prop]);
//                } else {
//                    target[prop] = source[prop];
//                }
//            }
//            return target;
//        }


        function extend() {
            var clone, copy, copyIsArray, deep, i, length, name, objectHelper, options, src, target;
            options = void 0;
            name = void 0;
            src = void 0;
            copy = void 0;
            copyIsArray = void 0;
            clone = void 0;
            target = arguments[0] || {};
            i = 1;
            length = arguments.length;
            deep = false;
            objectHelper = {
                hasOwn: Object.prototype.hasOwnProperty,
                class2type: {},
                type: function(obj) {
                    if (obj == null) {
                        return String(obj);
                    } else {
                        return objectHelper.class2type[Object.prototype.toString.call(obj)] || "object";
                    }
                },
                isPlainObject: function(obj) {
                    var e, key;
                    if (!obj || objectHelper.type(obj) !== "object" || obj.nodeType || objectHelper.isWindow(obj)) {
                        return false;
                    }
                    try {
                        if (obj.constructor && !objectHelper.hasOwn.call(obj, "constructor") && !objectHelper.hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                            return false;
                        }
                    } catch (_error) {
                        e = _error;
                        return false;
                    }
                    key = void 0;
                    for (key in obj) {
                        ({});
                    }
                    return key === undefined || objectHelper.hasOwn.call(obj, key);
                },
                isArray: Array.isArray || function(obj) {
                    return objectHelper.type(obj) === "array";
                },
                isFunction: function(obj) {
                    return objectHelper.type(obj) === "function";
                },
                isWindow: function(obj) {
                    return (obj != null) && obj === obj.window;
                }
            };
            if (typeof target === "boolean") {
                deep = target;
                target = arguments[1] || {};
                i = 2;
            }
            if (typeof target !== "object" && !objectHelper.isFunction(target)) {
                target = {};
            }
            if (length === i) {
                target = this;
                --i;
            }
            while (i < length) {
                if ((options = arguments[i]) != null) {
                    for (name in options) {
                        src = target[name];
                        copy = options[name];
                        if (target === copy) {
                            continue;
                        }
                        if (deep && copy && (objectHelper.isPlainObject(copy) || (copyIsArray = objectHelper.isArray(copy)))) {
                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = (src && objectHelper.isArray(src) ? src : []);
                            } else {
                                clone = (src && objectHelper.isPlainObject(src) ? src : {});
                            }
                            target[name] = extend(deep, clone, copy);
                        } else {
                            if (copy !== undefined) {
                                target[name] = copy;
                            }
                        }
                    }
                }
                i++;
            }
            return target;
        }




        // messy way to calculate default options without jquery.extend
        function calculateOptions(options) {

            // copy the default options so we don't accidentally modify them
            var defaultCopy = extend(true, {}, defaultOptions);

            var result;
            if (typeof options === 'object') {
                // extend modified the "target" variable
                result = extend(defaultCopy, options);
            } else {
                // no options were passed
                result = defaultOptions;
            }

            return result;
        }

        var publicInterface = {
            getArray: function(options) {
                var _options = calculateOptions(options);

                var set = wordSets[_options.wordSet];

                var choices = [];

                _options.wordTypes.forEach(function(key){
                    var len = set[key].length;
                    var index = Math.round(Math.random() * (len-1));
                    choices.push(set[key][index]);
                });

                return choices;
            },
            concatenate: function(choices) {
                var result = "";
                var len = choices.length;

                for( var i in choices )
                {
                    result = result + choices[i];

                    if( parseInt(i) !== (len-1) ) {
                        result = result + '-';
                    }
                }

                return result;
            },
            get: function (options) {

                var choices = this.getArray(options);
                var result = this.concatenate(choices);

                return result;
            }
        };

        return publicInterface;
    }


    window.OctoNameGenerator = constructor();

}(window));
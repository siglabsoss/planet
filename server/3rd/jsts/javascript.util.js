/*
 javascript.util is a port of selected parts of java.util to JavaScript which
 main purpose is to ease porting Java code to JavaScript.

 The MIT License (MIT)

 Copyright (C) 2011,2012 by The Authors

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
(function () {
    var e = function (t, n) {
        var r = e.resolve(t, n || "/"),
            i = e.modules[r];
        if (!i) throw new Error("Failed to resolve module " + t + ", tried " + r);
        var s = e.cache[r],
            o = s ? s.exports : i();
        return o
    };
    e.paths = [], e.modules = {}, e.cache = {}, e.extensions = [".js", ".coffee", ".json"], e._core = {
        assert: !0,
        events: !0,
        fs: !0,
        path: !0,
        vm: !0
    }, e.resolve = function () {
        return function (t, n) {
            function u(t) {
                t = r.normalize(t);
                if (e.modules[t]) return t;
                for (var n = 0; n < e.extensions.length; n++) {
                    var i = e.extensions[n];
                    if (e.modules[t + i]) return t + i
                }
            }

            function a(t) {
                t = t.replace(/\/+$/, "");
                var n = r.normalize(t + "/package.json");
                if (e.modules[n]) {
                    var i = e.modules[n](),
                        s = i.browserify;
                    if (typeof s == "object" && s.main) {
                        var o = u(r.resolve(t, s.main));
                        if (o) return o
                    } else if (typeof s == "string") {
                        var o = u(r.resolve(t, s));
                        if (o) return o
                    } else if (i.main) {
                        var o = u(r.resolve(t, i.main));
                        if (o) return o
                    }
                }
                return u(t + "/index")
            }

            function f(e, t) {
                var n = l(t);
                for (var r = 0; r < n.length; r++) {
                    var i = n[r],
                        s = u(i + "/" + e);
                    if (s) return s;
                    var o = a(i + "/" + e);
                    if (o) return o
                }
                var s = u(e);
                if (s) return s
            }

            function l(e) {
                var t;
                e === "/" ? t = [""] : t = r.normalize(e).split("/");
                var n = [];
                for (var i = t.length - 1; i >= 0; i--) {
                    if (t[i] === "node_modules") continue;
                    var s = t.slice(0, i + 1).join("/") + "/node_modules";
                    n.push(s)
                }
                return n
            }
            n || (n = "/");
            if (e._core[t]) return t;
            var r = e.modules.path();
            n = r.resolve("/", n);
            var i = n || "/";
            if (t.match(/^(?:\.\.?\/|\/)/)) {
                var s = u(r.resolve(i, t)) || a(r.resolve(i, t));
                if (s) return s
            }
            var o = f(t, i);
            if (o) return o;
            throw new Error("Cannot find module '" + t + "'")
        }
    }(), e.alias = function (t, n) {
        var r = e.modules.path(),
            i = null;
        try {
            i = e.resolve(t + "/package.json", "/")
        } catch (s) {
            i = e.resolve(t, "/")
        }
        var o = r.dirname(i),
            u = (Object.keys || function (e) {
                var t = [];
                for (var n in e) t.push(n);
                return t
            })(e.modules);
        for (var a = 0; a < u.length; a++) {
            var f = u[a];
            if (f.slice(0, o.length + 1) === o + "/") {
                var l = f.slice(o.length);
                e.modules[n + l] = e.modules[o + l]
            } else f === o && (e.modules[n] = e.modules[o])
        }
    },
        function () {
            var t = {}, n = typeof global != "undefined" ? global : {}, r = !1;
            e.define = function (i, s) {
                !r && e.modules.__browserify_process && (t = e.modules.__browserify_process(), r = !0);
                var o = e._core[i] ? "" : e.modules.path().dirname(i),
                    u = function (t) {
                        var n = e(t, o),
                            r = e.cache[e.resolve(t, o)];
                        return r && r.parent === null && (r.parent = a), n
                    };
                u.resolve = function (t) {
                    return e.resolve(t, o)
                }, u.modules = e.modules, u.define = e.define, u.cache = e.cache;
                var a = {
                    id: i,
                    filename: i,
                    exports: {},
                    loaded: !1,
                    parent: null
                };
                e.modules[i] = function () {
                    return e.cache[i] = a, s.call(a.exports, u, a, a.exports, o, i, t, n), a.loaded = !0, a.exports
                }
            }
        }(), e.define("path", function (e, t, n, r, i, s, o) {
        function u(e, t) {
            var n = [];
            for (var r = 0; r < e.length; r++) t(e[r], r, e) && n.push(e[r]);
            return n
        }

        function a(e, t) {
            var n = 0;
            for (var r = e.length; r >= 0; r--) {
                var i = e[r];
                i == "." ? e.splice(r, 1) : i === ".." ? (e.splice(r, 1), n++) : n && (e.splice(r, 1), n--)
            }
            if (t)
                for (; n--; n) e.unshift("..");
            return e
        }
        var f = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;
        n.resolve = function () {
            var e = "",
                t = !1;
            for (var n = arguments.length; n >= -1 && !t; n--) {
                var r = n >= 0 ? arguments[n] : s.cwd();
                if (typeof r != "string" || !r) continue;
                e = r + "/" + e, t = r.charAt(0) === "/"
            }
            return e = a(u(e.split("/"), function (e) {
                return !!e
            }), !t).join("/"), (t ? "/" : "") + e || "."
        }, n.normalize = function (e) {
            var t = e.charAt(0) === "/",
                n = e.slice(-1) === "/";
            return e = a(u(e.split("/"), function (e) {
                return !!e
            }), !t).join("/"), !e && !t && (e = "."), e && n && (e += "/"), (t ? "/" : "") + e
        }, n.join = function () {
            var e = Array.prototype.slice.call(arguments, 0);
            return n.normalize(u(e, function (e, t) {
                return e && typeof e == "string"
            }).join("/"))
        }, n.dirname = function (e) {
            var t = f.exec(e)[1] || "",
                n = !1;
            return t ? t.length === 1 || n && t.length <= 3 && t.charAt(1) === ":" ? t : t.substring(0, t.length - 1) : "."
        }, n.basename = function (e, t) {
            var n = f.exec(e)[2] || "";
            return t && n.substr(-1 * t.length) === t && (n = n.substr(0, n.length - t.length)), n
        }, n.extname = function (e) {
            return f.exec(e)[3] || ""
        }
    }), e.define("__browserify_process", function (e, t, n, r, i, s, o) {
        var s = t.exports = {};
        s.nextTick = function () {
            var e = typeof global != "undefined" && global.setImmediate,
                t = typeof global != "undefined" && global.postMessage && global.addEventListener;
            if (e) return global.setImmediate;
            if (t) {
                var n = [];
                return global.addEventListener("message", function (e) {
                    if (e.source === global && e.data === "browserify-tick") {
                        e.stopPropagation();
                        if (n.length > 0) {
                            var t = n.shift();
                            t()
                        }
                    }
                }, !0),
                    function (t) {
                        n.push(t), global.postMessage("browserify-tick", "*")
                    }
            }
            return function (t) {
                setTimeout(t, 0)
            }
        }(), s.title = "browser", s.browser = !0, s.env = {}, s.argv = [], s.binding = function (t) {
            if (t === "evals") return e("vm");
            throw new Error("No such module. (Possibly not yet loaded)")
        },
            function () {
                var t = "/",
                    n;
                s.cwd = function () {
                    return t
                }, s.chdir = function (r) {
                    n || (n = e("path")), t = n.resolve(r, t)
                }
            }()
    }), e.define("/ArrayList.js", function (e, t, n, r, i, s, o) {
        function h() {
            this.array = [], arguments[0] instanceof u && this.addAll(arguments[0])
        }
        var u = e("./Collection"),
            a = e("./List"),
            f = e("./IndexOutOfBoundsException"),
            l = e("./NoSuchElementException"),
            c = e("./OperationNotSupported");
        h.prototype = new a, h.prototype.array = null, h.prototype.add = function (e) {
            return this.array.push(e), !0
        }, h.prototype.addAll = function (e) {
            for (var t = e.iterator(); t.hasNext();) this.add(t.next());
            return !0
        }, h.prototype.set = function (e, t) {
            var n = this.array[e];
            return this.array[e] = t, n
        }, h.prototype.iterator = function () {
            return new h.Iterator(this)
        }, h.prototype.get = function (e) {
            if (e < 0 || e >= this.size()) throw new f;
            return this.array[e]
        }, h.prototype.isEmpty = function () {
            return this.array.length === 0
        }, h.prototype.size = function () {
            return this.array.length
        }, h.prototype.toArray = function () {
            var e = [];
            for (var t = 0, n = this.array.length; t < n; t++) e.push(this.array[t]);
            return e
        }, h.prototype.remove = function (e) {
            var t = !1;
            for (var n = 0, r = this.array.length; n < r; n++)
                if (this.array[n] === e) {
                    this.array.splice(n, 1), t = !0;
                    break
                }
            return t
        }, h.Iterator = function (e) {
            this.arrayList = e
        }, h.Iterator.prototype.arrayList = null, h.Iterator.prototype.position = 0, h.Iterator.prototype.next = function () {
            if (this.position === this.arrayList.size()) throw new l;
            return this.arrayList.get(this.position++)
        }, h.Iterator.prototype.hasNext = function () {
            return this.position < this.arrayList.size() ? !0 : !1
        }, h.Iterator.prototype.remove = function () {
            throw new c
        }, t.exports = h
    }), e.define("/Collection.js", function (e, t, n, r, i, s, o) {
        function a() {}
        var u = e("./Iterator");
        a.prototype.add = function (e) {}, a.prototype.addAll = function (e) {}, a.prototype.isEmpty = function () {}, a.prototype.iterator = function () {}, a.prototype.size = function () {}, a.prototype.toArray = function () {}, a.prototype.remove = function (e) {}, t.exports = a
    }), e.define("/Iterator.js", function (e, t, n, r, i, s, o) {
        function u() {}
        u.prototype.hasNext = function () {}, u.prototype.next = function () {}, u.prototype.remove = function () {}, t.exports = u
    }), e.define("/List.js", function (e, t, n, r, i, s, o) {
        function a() {}
        var u = e("./Collection");
        a.prototype = new u, a.prototype.get = function (e) {}, a.prototype.set = function (e, t) {}, a.prototype.isEmpty = function () {}, t.exports = a
    }), e.define("/IndexOutOfBoundsException.js", function (e, t, n, r, i, s, o) {
        function u(e) {
            this.message = e || ""
        }
        u.prototype = new Error, u.prototype.name = "IndexOutOfBoundsException", t.exports = u
    }), e.define("/NoSuchElementException.js", function (e, t, n, r, i, s, o) {
        function u(e) {
            this.message = e || ""
        }
        u.prototype = new Error, u.prototype.name = "NoSuchElementException", t.exports = u
    }), e.define("/OperationNotSupported.js", function (e, t, n, r, i, s, o) {
        function u(e) {
            this.message = e || ""
        }
        u.prototype = new Error, u.prototype.name = "OperationNotSupported", t.exports = u
    }), e.define("/Arrays.js", function (e, t, n, r, i, s, o) {
        function u() {}
        u.sort = function () {
            var e = arguments[0],
                t, n, r, i;
            if (arguments.length === 1) {
                e.sort();
                return
            }
            if (arguments.length === 2) r = arguments[1], i = function (e, t) {
                return r.compare(e, t)
            }, e.sort(i);
            else {
                if (arguments.length === 3) {
                    n = e.slice(arguments[1], arguments[2]), n.sort();
                    var s = e.slice(0, arguments[1]).concat(n, e.slice(arguments[2], e.length));
                    e.splice(0, e.length);
                    for (t = 0; t < s.length; t++) e.push(s[t]);
                    return
                }
                if (arguments.length === 4) {
                    n = e.slice(arguments[1], arguments[2]), r = arguments[3], i = function (e, t) {
                        return r.compare(e, t)
                    }, n.sort(i), s = e.slice(0, arguments[1]).concat(n, e.slice(arguments[2], e.length)), e.splice(0, e.length);
                    for (t = 0; t < s.length; t++) e.push(s[t]);
                    return
                }
            }
        }, u.asList = function (e) {
            var t = new javascript.util.ArrayList;
            for (var n = 0, r = e.length; n < r; n++) t.add(e[n]);
            return t
        }, t.exports = u
    }), e.define("/EmptyStackException.js", function (e, t, n, r, i, s, o) {
        function u(e) {
            this.message = e || ""
        }
        u.prototype = new Error, u.prototype.name = "EmptyStackException", t.exports = u
    }), e.define("/HashMap.js", function (e, t, n, r, i, s, o) {
        function f() {
            this.object = {}
        }
        var u = e("./Map"),
            a = e("./ArrayList");
        f.prototype = new u, f.prototype.object = null, f.prototype.get = function (e) {
            return this.object[e] || null
        }, f.prototype.put = function (e, t) {
            return this.object[e] = t, t
        }, f.prototype.values = function () {
            var e = new javascript.util.ArrayList;
            for (var t in this.object) this.object.hasOwnProperty(t) && e.add(this.object[t]);
            return e
        }, f.prototype.size = function () {
            return this.values().size()
        }, t.exports = f
    }), e.define("/Map.js", function (e, t, n, r, i, s, o) {
        function u() {}
        u.prototype.get = function (e) {}, u.prototype.put = function (e, t) {}, u.prototype.size = function () {}, u.prototype.values = function () {}, t.exports = u
    }), e.define("/Set.js", function (e, t, n, r, i, s, o) {
        function a() {}
        var u = e("./Collection");
        a.prototype = new u, a.prototype.contains = function (e) {}, t.exports = a
    }), e.define("/HashSet.js", function (e, t, n, r, i, s, o) {
        function c() {
            this.array = [], arguments[0] instanceof u && this.addAll(arguments[0])
        }
        var u = e("./Collection"),
            a = e("./Set"),
            f = e("./OperationNotSupported"),
            l = e("./NoSuchElementException");
        c.prototype = new a, c.prototype.array = null, c.prototype.contains = function (e) {
            for (var t = 0, n = this.array.length; t < n; t++) {
                var r = this.array[t];
                if (r === e) return !0
            }
            return !1
        }, c.prototype.add = function (e) {
            return this.contains(e) ? !1 : (this.array.push(e), !0)
        }, c.prototype.addAll = function (e) {
            for (var t = e.iterator(); t.hasNext();) this.add(t.next());
            return !0
        }, c.prototype.remove = function (e) {
            throw new f
        }, c.prototype.size = function () {
            return this.array.length
        }, c.prototype.isEmpty = function () {
            return this.array.length === 0
        }, c.prototype.toArray = function () {
            var e = [];
            for (var t = 0, n = this.array.length; t < n; t++) e.push(this.array[t]);
            return e
        }, c.prototype.iterator = function () {
            return new c.Iterator(this)
        }, c.Iterator = function (e) {
            this.hashSet = e
        }, c.Iterator.prototype.hashSet = null, c.Iterator.prototype.position = 0, c.Iterator.prototype.next = function () {
            if (this.position === this.hashSet.size()) throw new l;
            return this.hashSet.array[this.position++]
        }, c.Iterator.prototype.hasNext = function () {
            return this.position < this.hashSet.size() ? !0 : !1
        }, c.Iterator.prototype.remove = function () {
            throw new javascript.util.OperationNotSupported
        }, t.exports = c
    }), e.define("/SortedMap.js", function (e, t, n, r, i, s, o) {
        function a() {}
        var u = e("./Map");
        a.prototype = new u, t.exports = a
    }), e.define("/SortedSet.js", function (e, t, n, r, i, s, o) {
        function a() {}
        var u = e("./Set");
        a.prototype = new u, t.exports = a
    }), e.define("/Stack.js", function (e, t, n, r, i, s, o) {
        function f() {
            this.array = []
        }
        var u = e("./List"),
            a = e("./EmptyStackException");
        f.prototype = new u, f.prototype.array = null, f.prototype.push = function (e) {
            return this.array.push(e), e
        }, f.prototype.pop = function (e) {
            if (this.array.length === 0) throw new a;
            return this.array.pop()
        }, f.prototype.peek = function () {
            if (this.array.length === 0) throw new a;
            return this.array[this.array.length - 1]
        }, f.prototype.empty = function (e) {
            return this.array.length === 0 ? !0 : !1
        }, f.prototype.isEmpty = function () {
            return this.empty()
        }, f.prototype.search = function (e) {
            return this.array.indexOf(e)
        }, f.prototype.size = function () {
            return this.array.length
        }, f.prototype.toArray = function () {
            var e = [];
            for (var t = 0, n = this.array.length; t < n; t++) e.push(this.array[t]);
            return e
        }, t.exports = f
    }), e.define("/TreeMap.js", function (e, t, n, r, i, s, o) {
        function l() {
            this.array = []
        }
        var u = e("./Map"),
            a = e("./SortedMap"),
            f = e("./ArrayList");
        l.prototype = new u, l.prototype.array = null, l.prototype.get = function (e) {
            for (var t = 0, n = this.array.length; t < n; t++) {
                var r = this.array[t];
                if (r.key.compareTo(e) === 0) return r.value
            }
            return null
        }, l.prototype.put = function (e, t) {
            var n = this.get(e);
            if (n) {
                var r = n.value;
                return n.value = t, r
            }
            var i = {
                key: e,
                value: t
            };
            for (var s = 0, o = this.array.length; s < o; s++) {
                n = this.array[s];
                if (n.key.compareTo(e) === 1) return this.array.splice(s, 0, i), null
            }
            return this.array.push({
                key: e,
                value: t
            }), null
        }, l.prototype.values = function () {
            var e = new javascript.util.ArrayList;
            for (var t = 0, n = this.array.length; t < n; t++) e.add(this.array[t].value);
            return e
        }, l.prototype.size = function () {
            return this.values().size()
        }, t.exports = l
    }), e.define("/TreeSet.js", function (e, t, n, r, i, s, o) {
        function c() {
            this.array = [], arguments[0] instanceof u && this.addAll(arguments[0])
        }
        var u = e("./Collection"),
            a = e("./SortedSet"),
            f = e("./OperationNotSupported"),
            l = e("./NoSuchElementException");
        c.prototype = new a, c.prototype.array = null, c.prototype.contains = function (e) {
            for (var t = 0, n = this.array.length; t < n; t++) {
                var r = this.array[t];
                if (r.compareTo(e) === 0) return !0
            }
            return !1
        }, c.prototype.add = function (e) {
            if (this.contains(e)) return !1;
            for (var t = 0, n = this.array.length; t < n; t++) {
                var r = this.array[t];
                if (r.compareTo(e) === 1) return this.array.splice(t, 0, e), !0
            }
            return this.array.push(e), !0
        }, c.prototype.addAll = function (e) {
            for (var t = e.iterator(); t.hasNext();) this.add(t.next());
            return !0
        }, c.prototype.remove = function (e) {
            throw new f
        }, c.prototype.size = function () {
            return this.array.length
        }, c.prototype.isEmpty = function () {
            return this.array.length === 0
        }, c.prototype.toArray = function () {
            var e = [];
            for (var t = 0, n = this.array.length; t < n; t++) e.push(this.array[t]);
            return e
        }, c.prototype.iterator = function () {
            return new c.Iterator(this)
        }, c.Iterator = function (e) {
            this.treeSet = e
        }, c.Iterator.prototype.treeSet = null, c.Iterator.prototype.position = 0, c.Iterator.prototype.next = function () {
            if (this.position === this.treeSet.size()) throw new l;
            return this.treeSet.array[this.position++]
        }, c.Iterator.prototype.hasNext = function () {
            return this.position < this.treeSet.size() ? !0 : !1
        }, c.Iterator.prototype.remove = function () {
            throw new javascript.util.OperationNotSupported
        }, t.exports = c
    }), e.define("/javascript.util.js", function (e, t, n, r, i, s, o) {
        var u = {};
        u.util = {}, u.util.version = "0.10.0", u.util.ArrayList = e("./ArrayList"), u.util.Arrays = e("./Arrays"), u.util.Collection = e("./Collection"), u.util.EmptyStackException = e("./EmptyStackException"), u.util.HashMap = e("./HashMap"), u.util.IndexOutOfBoundsException = e("./IndexOutOfBoundsException"), u.util.Iterator = e("./Iterator"), u.util.List = e("./List"), u.util.Map = e("./Map"), u.util.NoSuchElementException = e("./NoSuchElementException"), u.util.OperationNotSupported = e("./OperationNotSupported"), u.util.Set = e("./Set"), u.util.HashSet = e("./HashSet"), u.util.SortedMap = e("./SortedMap"), u.util.SortedSet = e("./SortedSet"), u.util.Stack = e("./Stack"), u.util.TreeMap = e("./TreeMap"), u.util.TreeSet = e("./TreeSet"), this.javascript = u;
        var a;
        typeof global != "undefined" ? a = global : a = o, a.javascript = u
    }), e("/javascript.util.js")
})();

window.resize = function(t) {
    var c, h, m, top, w;
    w = window.innerWidth;
    h = window.innerHeight;
    top = t.find('#map').offsetTop;
    c = w - 40;
    m = (h - top) - 65;
    t.find('#main_map_container').style.width = "" + c + "px";
    return t.find('#map').style.height = "" + m + "px";
};



Template.main_map.rendered = function() {
    var query,
        _this = this;
    key = "d4b5ecf084be4fd5b333f2bc34c1df12";
    mapStyle = "67367"; // dark blue
    mapStyle = "2172"; //lighter gmaps clone
    window.resize(this);
    $(window).resize(function() {
        return window.resize(_this);
    });
    L.Icon.Default.imagePath = 'packages/leaflet/images';
    window.map = L.map('map', {
        doubleClickZoom: false
    }).setView([37.471075, -122.203932], 13);
    L.tileLayer("http://{s}.tile.cloudmade.com/" + key + "/" + mapStyle + "/256/{z}/{x}/{y}.png", {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
    }).addTo(window.map);
    window.map.on('dblclick', function(e) {
        return Markers.insert({
            latlng: e.latlng
        });
    });
//    query = Markers.find({});
//    return query.observe({
//        added: function(mark) {
//            var marker;
//            return marker = L.marker(mark.latlng).addTo(window.map).on('click', function(e) {
//                return Markers.remove({
//                    latlng: this._latlng
//                });
//            });
//        },
//        removed: function(mark) {
//            var key, layers, val, _results;
//            layers = window.map._layers;
//            _results = [];
//            for (key in layers) {
//                val = layers[key];
//                if (!val._latlng) {
//
//                } else {
//                    if (val._latlng.lat === mark.latlng.lat && val._latlng.lng === mark.latlng.lng) {
//                        _results.push(window.map.removeLayer(val));
//                    } else {
//                        _results.push(void 0);
//                    }
//                }
//            }
//            return _results;
//        }
//    });
};

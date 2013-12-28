
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



// this array has "file scope" because it is var
var clientMapMarkers = [];

if (Meteor.isClient) {

}

function insertClientMapMarker(marker, doc)
{
//    console.log(doc);

    // save an associative array indexed by the mongo id
    clientMapMarkers[doc._id] = marker;


//    console.log(clientMapMarkers);
}

function updateClientMapMarker(id, fields)
{
    // pull the object from the array and update its lat lon
    clientMapMarkers[id._id].setLatLng(L.latLng([id.lat, id.lon]));

//    console.log(clientMapMarkers);
}


// called in rendered
function bindDashboardElements()
{
    $('.showFenceDrop').on('click', function(e){

//        debugger;

        var newValue = ! Settings.findOne(settingsDocId()).view.showFences;

        Settings.update(settingsDocId(), {$set:{view:{showFences:newValue}}})
    });
}

Template.dashboard.rendered = function() {

    // do general stuff

    // (re) Bind all our dom elements
    bindDashboardElements();
}


function mainMapRunOnce()
{
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
    }).setView([37.471075, -121.600932], 10);
    L.tileLayer("http://{s}.tile.cloudmade.com/" + key + "/" + mapStyle + "/256/{z}/{x}/{y}.png", {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
    }).addTo(window.map);
    window.map.on('dblclick', function(e) {
//        return Markers.insert({
//            latlng: e.latlng
//        });
        console.log("double clicked at " + e.latlng.lat + ", " + e.latlng.lng);
    });












    var drawnItems = new L.FeatureGroup();
    window.map.addLayer(drawnItems);

    // Set the title to show on the polygon button
    L.drawLocal.draw.toolbar.buttons.polygon = 'Draw a GEO fence!';

    var drawControl = new L.Control.Draw({
        position: 'topleft',
        draw: {
            polyline: {
                metric: false
            },
            polygon: {
                allowIntersection: false,
                showArea: true,
                drawError: {
                    color: '#b00b00',
                    timeout: 1000
                },
                shapeOptions: {
                    color: '#bada55'
                }
            },
            circle: {
                shapeOptions: {
                    color: '#662d91'
                }
            },
            marker: false
        },
        edit: {
            featureGroup: drawnItems,
            remove: false
        }
    });
    window.map.addControl(drawControl);

    window.map.on('draw:created', function (e) {
        var type = e.layerType,
            layer = e.layer;

        if (type === 'marker') {
            layer.bindPopup('A popup!');
        }

        drawnItems.addLayer(layer);
    });

    window.map.on('draw:edited', function (e) {
        var layers = e.layers;
        var countOfEditedLayers = 0;
        layers.eachLayer(function(layer) {
            countOfEditedLayers++;
        });
        console.log("Edited " + countOfEditedLayers + " layers");
    });

//    L.DomUtil.get('changeColor').onclick = function () {
//        drawControl.setDrawingOptions({ rectangle: { shapeOptions: { color: '#004a80' } } });
//    };





















//    var marker = L.marker([32, -122]).addTo(window.map);



    query = Devices.find({});
    query.observe({
        added: function(mark) {
            var marker;
            var pos = [mark.lat, mark.lon];
//            debugger;
//            var other = L.marker(pos);
//            var o = {lat:}
//            debugger;
//            return {};

//            console.log(clientMapMarkers);

            marker = L.marker(pos);

//            console.log(marker);

            // after calling marker.addTo (or map.addLayer(marker)) the marker object gets a new member, called _leaflet_id
            marker.addTo(window.map).on('click', function(e) {
//                return Markers.remove({
//                    latlng: this._latlng
//                });
                console.log("clicked on " + pos[0] + "," + pos[1]);
            });



            insertClientMapMarker(marker, mark);

//            console.log(marker);
        },
        changed: updateClientMapMarker,
        removed: function(mark) {
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
        }
    });
}

var callMainMapRunOnce = (function(thisVar) {
    // Code inside {} will be executed once only

    // parts use "this", so we need to use javascript's native call() so we can set the value of "this" for mainMapRunOnce
    mainMapRunOnce.call(thisVar);
}).once();

Template.mainMap.rendered = function() {

    // The main leaflet map is surrounded by a #constant block
    // meteor respects this, however it still calls rendered to let is know that all parts not in #constant were rendered
    // We need to do leaflet map stuff one time.

    // This function uses sugarjs runonce capability.
    // Things are complicated by the fact that the leaflet needs "this" to be preserved
    callMainMapRunOnce(this);
};


Template.dashboard.showFenceSetting = function()
{
    var o = Settings.findOne({userId:fakeUserId()});

    // default value
    if( ! (o && o.view) )
        return true;

    return o.view.showFences;
}

// Returns raw html for an alert
// Clears a css class which causes alert to fade away after time
Template.flashAlert.rawHtml = function()
{
    var m = Session.get("flashAlertMessageObject");
    if( !m )
        return "";

    // See: http://stackoverflow.com/questions/7676356/can-twitter-bootstrap-alerts-fade-in-as-well-as-out
    setTimeout(function(){
        $('#myFlashAlert').removeClass('fadein');
        setTimeout(function(){Session.set("flashAlertMessageObject", null);},1000); // remove session var after fade has completed or template rerender will instantly remove
    }, m.options.hideAfter);

    return "<div id='myFlashAlert' class='alert alert-" + m.options.type + " fade fadein floatingAlert'>"+ m.message+"</div>";
}

// Call to flash a message to the user which will fade away. The options parameter is optional
flashAlertMessage = function(message, options)
{
    var def = {hideAfter:3000,type:'success'}

    options = typeof options !== 'undefined' ? options : def;
    options.hideAfter = options.hideAfter || def.hideAfter;
    options.type = options.type || def.type;

    Session.set("flashAlertMessageObject", {message:message,options:options});

}
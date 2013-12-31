
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

function insertClientMapMarker(marker, doc)
{
//    console.log(doc);

    // save an associative array indexed by the mongo id
    clientMapMarkers[doc._id] = marker;


//    console.log(clientMapMarkers);
}

function updateClientMapMarker(newDocument, oldDocument)
{
    // pull the object from the array and update its lat lon
    clientMapMarkers[newDocument._id].setLatLng(L.latLng([newDocument.lat, newDocument.lon]));

//    console.log(clientMapMarkers);
}




function insertFenceFromLeafletEvent(e)
{
    var type = e.layerType,
        layer = e.layer;

    var doc = {layerType:type, layer:{options:{}}};

    // copy the things we need
    doc.layer._latlngs = layer._latlngs;
    doc.layer.options.color = layer.options.color;
    doc.layer.options.fill = layer.options.fill;
    doc.layer.options.fillColor = layer.options.fillColor;
    doc.layer.options.fillOpacity = layer.options.fillOpacity;
    doc.layer.options.opacity = layer.options.opacity;
    doc.layer.options.stroke = layer.options.stroke;
    doc.layer.options.weight = layer.options.weight;


    doc.userId = fakeUserId();

    Fences.insert(doc);
}

//applies all properties except for latlngs to a layer object
function applyLayerPropertiesFromDoc(layer, document)
{
    layer.setStyle(document.layer.options);
}

function buildLeafletLayerFromDoc(document)
{
    var pointList = [];

    for( var i in document.layer._latlngs )
    {
        var p = document.layer._latlngs[i];

        var pointObject = new L.LatLng(p.lat, p.lng);

        pointList.push(pointObject);
    }

    if( document.layerType === "rectangle" )
    {
        var o = new L.Rectangle(pointList);

        applyLayerPropertiesFromDoc(o, document);




//        debugger;
        return o;

    }

//    var pointA = new L.LatLng(28.635308, 77.22496);
//    var pointB = new L.LatLng(28.984461, 77.70641);
//    var pointList = [pointA, pointB];
//
//    var firstpolyline = new L.Polyline(pointList {
//    color: 'red',
//        weight: 3,
//        opacity: 0.5
//    smoothFactor: 1
//
//});
}



// this array has "file scope" because it is var
var clientFences = [];

function installMapViewAutorun()
{
    Deps.autorun(function() {

        if( getShowFences() )
        {

            var query = Fences.find({userId:fakeUserId()});

            query.observe({
                added: function(document) {
//                    console.log('fence added');
                    var layer = buildLeafletLayerFromDoc(document);

                    clientFences[document._id] = layer;

                    drawnItemsLayerGroup.addLayer(clientFences[document._id]);
                },
                changed: function(newDocument, oldDocument){
                    console.log('change');

                    var layer = drawnItemsLayerGroup.getLayer(clientFences[newDocument._id]._leaflet_id);

                    applyLayerPropertiesFromDoc(layer, newDocument);

                },
                removed: function(oldDocument) {
                    // remove the layer from the map
                    drawnItemsLayerGroup.removeLayer(clientFences[oldDocument._id]._leaflet_id);

                    // delete our record of the layer
                    delete(clientFences[i]);
                }
            });
        }
        else
        {
            // if the user turns fences off, this gets called but observe.remove above does not
            if( clientFences )
            {
                for( var i in clientFences )
                {
                    // remove the layer from the map
                    drawnItemsLayerGroup.removeLayer(clientFences[i]._leaflet_id);

                    // delete our record of the layer
                    delete(clientFences[i]);
                }
            }
        }

    });
}


var drawnItemsLayerGroup;


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












    drawnItemsLayerGroup = new L.FeatureGroup();
    window.map.addLayer(drawnItemsLayerGroup);

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
            featureGroup: drawnItemsLayerGroup,
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

        insertFenceFromLeafletEvent(e);

        // don't add it now because our Deps.autorun will do it for us
//        drawnItemsLayerGroup.addLayer(layer);
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


    // This autorun requires that the map objects have already been created
    installMapViewAutorun();
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

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
    // pull the object from the array and update its lat lng
    clientMapMarkers[newDocument._id].setLatLng(L.latLng([newDocument.lat, newDocument.lng]));

//    console.log(clientMapMarkers);
}




function insertFenceFromLeafletEvent(e)
{
    var type = e.layerType,
        layer = e.layer;

    var doc = {layerType:type, layer:{options:{}}};

    // Below here we copy the things we need into the db


    if( type === "rectangle" || type === "polygon" )
    {
        doc.layer._latlngs = layer._latlngs;
    }

    if( type === "circle")
    {
        doc.layer._latlng = layer._latlng;
        doc.layer._mRadius = layer._mRadius;
    }

    // style stuff
    doc.layer.options.color = layer.options.color;
    doc.layer.options.fill = layer.options.fill;
    doc.layer.options.fillColor = layer.options.fillColor;
    doc.layer.options.fillOpacity = layer.options.fillOpacity;
    doc.layer.options.opacity = layer.options.opacity;
    doc.layer.options.stroke = layer.options.stroke;
    doc.layer.options.weight = layer.options.weight;


    doc.userId = fakeUserId();

    // FIXME: this should be enforced server side once subscriptions are added
    doc.devices = [];

    Fences.insert(doc);
}

// applies all properties except for latlngs to a layer object
function applyLayerStylePropertiesFromDoc(layer, document)
{
    layer.setStyle(document.layer.options);
}

// returns a point list for shapes
// circles are a special case which return something like [[50.5, 30.5], 200]
function getLayerShapeForDoc(document)
{
    var pointList = [];

    if(document.layerType === "rectangle" || document.layerType === "polygon")
    {
        for( var i in document.layer._latlngs )
        {
            var p = document.layer._latlngs[i];

            var pointObject = new L.LatLng(p.lat, p.lng);

            pointList.push(pointObject);
        }
    }

    if(document.layerType === "circle")
    {
        var pointObject = new L.LatLng(document.layer._latlng.lat, document.layer._latlng.lng);

        // push a LatLng object
        pointList.push(pointObject);

        // push a raw double (This is unconventional)
        pointList.push(document.layer._mRadius);
    }

    return pointList;
}

// applies bounds properties to circle rectangle and polygon types
function applyLayerBoundsFromDoc(layer, document)
{
    var bounds = getLayerShapeForDoc(document);

    if(document.layerType === "circle" )
    {
        layer.setLatLng(bounds[0]);
        layer.setRadius(bounds[1]);
    }

    if(document.layerType === "rectangle")
    {
        layer.setBounds(bounds);
    }

    if(document.layerType === "polygon")
    {
        layer.setLatLngs(bounds);
    }
}

function buildLeafletLayerFromDoc(document)
{
    var pointList = getLayerShapeForDoc(document);

    var o = null;

    if( document.layerType === "rectangle" )
    {
        o = new L.Rectangle(pointList);
//        o.editing.enable();
    }

    if( document.layerType === "polygon" )
    {
        o = new L.Polygon(pointList);
    }

    if( document.layerType === "circle" )
    {
        o = new L.Circle(pointList[0], pointList[1]);
    }

    applyLayerStylePropertiesFromDoc(o, document);




    // build a popup object with empty content
    var popup = new L.popup().setContent("");

    var popupOpened = function(event) {
        // (re) render popup content
        // Wrapping this with Meteor.render() seems to break clicking the same geofence twice without clicking away in-between
        popup.setContent(Template.geoFencePopup(Fences.findOne(document._id)));

        // call the normal popup open
        event.target._openPopup(event);
    };

    // normal popup binding
    o.bindPopup(popup);


    // remove default click added by bindPopup
    o.off('click', this._openPopup);

    // add our own handler
    o.on('click', popupOpened, o);

    // I couldn't get this to work for the life of me
//    o._popupHandlersAdded = true;

    return o;
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
                    var layer = buildLeafletLayerFromDoc(document);

                    clientFences[document._id] = layer;

//                    clientFences[document._id].editing.enable();

                    drawnItemsLayerGroup.addLayer(clientFences[document._id]);
                },
                changed: function(newDocument, oldDocument){
                    var layer = drawnItemsLayerGroup.getLayer(clientFences[newDocument._id]._leaflet_id);

                    applyLayerStylePropertiesFromDoc(layer, newDocument);

                    applyLayerBoundsFromDoc(layer, newDocument);
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
            polyline: false,
            polygon: {
                allowIntersection: false,
                showArea: true,
                drawError: {
                    color: '#b00b00',
                    timeout: 1000
                },
                shapeOptions: {
                    color: '#44dd44'
                }
            },
            circle: {
                shapeOptions: {
                    color: '#662d91'
                }
            },
            marker: false
        },
        edit: false
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
            var pos = [mark.lat, mark.lng];
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
                console.log("clicked on " + mark._id);
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

Template.geoFencePopupDevices.deviceListTruncated = function() {

    if(!this.devices) {
        return [];
    }

    // this could be saved as a setting
    var maxLength = 5;

    var deviceIds = this.devices.splice(0,maxLength);

    // only return the first N devices
    var result = Devices.find({_id: {$in: deviceIds}});

    // since result is a cursor and not a fetched array, we must use count() to see how many would be returned
    if( result.count() === 0 ) {
        return [{serial:'',_id:'empty list'}];
    } else {
        return result;
    }
};
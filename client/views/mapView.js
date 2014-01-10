"use-strict";

// settings

// popup_width
var mapPopupOptions = {maxWidth:600,minWidth:300};

window.resize = function(t) {
    var c, h, m, top, w;
    w = window.innerWidth;
    h = window.innerHeight;
    top = t.find('#map').offsetTop;
    var leftPanelWidth = $('#leftMapPanel').width();
    c = w - leftPanelWidth - 1;
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


function buildLeafletMarkerFromDoc(document)
{
    var marker;
    var pos = [document.lat, document.lng];

    marker = L.marker(pos);

    var popup = new L.popup(mapPopupOptions).setContent("");

    var popupOpened = function(event) {
        // (re) render popup content
        // Wrapping this with Meteor.render() seems to break clicking the same geofence twice without clicking away in-between
        var updatedDevice = Devices.findOne(document._id);
        popup.setContent(Template.devicePopup(updatedDevice));

        // call the normal popup open
        event.target.openPopup();

        // Bind elements in the popup
        bindDevicePopupElements(updatedDevice);
    };

    // normal popup binding
    marker.bindPopup(popup);

    // remove default click added by bindPopup
    marker.off('click');

    // add our own handler
    marker.on('click', popupOpened, marker);

    return marker;
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
    var popup = new L.popup(mapPopupOptions).setContent("");

    var popupOpened = function(event) {
        // (re) render popup content
        // Wrapping this with Meteor.render() seems to break clicking the same geofence twice without clicking away in-between
        popup.setContent(Template.geoFencePopup(Fences.findOne(document._id)));

        // call the normal popup open
        event.target._openPopup(event);

        // Bind elements in the popup
        bindFencePopupElements();
    };

    // normal popup binding
    o.bindPopup(popup);

    // remove default click added by bindPopup
    o.off('click');

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
    window.mapObject = L.map('map', {
        doubleClickZoom: false
    }).setView([37.471075, -121.600932], 10);
    L.tileLayer("http://{s}.tile.cloudmade.com/" + key + "/" + mapStyle + "/256/{z}/{x}/{y}.png", {
        attribution: ''
    }).addTo(window.mapObject);
    window.mapObject.on('dblclick', function(e) {
//        return Markers.insert({
//            latlng: e.latlng
//        });
        console.log("double clicked at " + e.latlng.lat + ", " + e.latlng.lng);
    });












    drawnItemsLayerGroup = new L.FeatureGroup();
    window.mapObject.addLayer(drawnItemsLayerGroup);

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
    window.mapObject.addControl(drawControl);

    window.mapObject.on('draw:created', function (e) {
        var type = e.layerType,
            layer = e.layer;

        if (type === 'marker') {
            layer.bindPopup('A popup!');
        }

        insertFenceFromLeafletEvent(e);

        // don't add it now because our Deps.autorun will do it for us
//        drawnItemsLayerGroup.addLayer(layer);
    });

    window.mapObject.on('draw:edited', function (e) {
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
        added: function(document) {
            var marker = buildLeafletMarkerFromDoc(document);


            // after calling marker.addTo (or map.addLayer(marker)) the marker object gets a new member, called _leaflet_id
            marker.addTo(window.mapObject);



            insertClientMapMarker(marker, document);
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

Template.mainMapAndLeft.rendered = function() {

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


Deps.autorun(function(){



    if( Session.get("shouldShowMainMap") ) {
        $('.shownOnlyWithMap').removeClass('hidden');

        // required if showing map after putting in hidden div
        if( window && window.mapObject ) {
            window.mapObject.invalidateSize();
        }

    } else {
        console.log("HIDING CLASS");
        $('.shownOnlyWithMap').addClass('hidden');
    }

});

function bindDevicePopupElements(document)
{
    // ------------ Group Search ------------

    var groupSearchSelector = '#device-popup-group-input-' + document._id;

    var customSearchFunction = function(text, callback){

        // build regex to find text anywhere in field
        var expression = ".*"+text+".*";
        var rx = RegExp(expression,'i');

        // search mongo
        var groups = Groups.find({name:rx}).fetch();

        // give results back to dropdown thing
        callback(groups);
    };

    var onAdd = function(group) {
        Devices.update(document._id, {$addToSet:{'parents': group._id}})
    };
    var onDelete = function(group) {
        Devices.update(document._id, {$pull:{'parents': group._id}})
    };

    var parents = document.parents ? document.parents : [];

    // get group objects for groups that this device directly belongs to
    var belongsToGroups = Groups.find({_id: {$in: parents}}).fetch();

    console.log(belongsToGroups);

    $(groupSearchSelector).tokenInput("", {
        theme: "facebook",
        doSearch: customSearchFunction,
        onAdd: onAdd,
        onDelete: onDelete,
        prePopulate: belongsToGroups,
        hintText: "Type a group name"

    });

    // fix sizing when pre-populating a non empty list
    $(groupSearchSelector).tokenInput("resizeInput");


}

function bindFencePopupElements()
{

    $('.deleteFenceLink').off('click');

    $('.deleteFenceLink').on('click', function(e){
        var deleteFenceId = this.getAttribute('data-id');

        if (confirm('Are you sure you want to delete this fence?')) {
            Fences.remove(deleteFenceId);
            flashAlertMessage("Fence deleted", {hideAfter:2000});
        } else {
            // Do nothing!
        }
    });
}

Template.leftPanelGroup.rendered = function() {

    var leftGroupDragAllowed = function(placeholder, placeholderParent, originalItem)
    {
        return false;
    };

    $('ol.sortable').nestedSortable({
        forcePlaceholderSize: true,
        handle: 'div',
        helper:	'clone',
        items: 'li',
        opacity: .6,
        placeholder: 'placeholder',
        revert: 250,
        tabSize: 25,
        tolerance: 'pointer',
        toleranceElement: '> div',
        maxLevels: 5,
        isAllowed: leftGroupDragAllowed,
        isTree: true,
        expandOnHover: 700,
        startCollapsed: false
    });


    $('.disclose').on('click', function() {
        $(this).closest('li').toggleClass('mjs-nestedSortable-collapsed').toggleClass('mjs-nestedSortable-expanded');
    })
}



Template.leftPanelGroups.groups = function() {
    var flatGroups = Groups.find().fetch();

//    var devices = Devices.find().fetch();

//    var merged = mergeDevicesGroups(devices, flatGroups);

    return buildItemHeirarchy(flatGroups,{depth:true});
}

Template.leftPanelGroup.style = function() {
    var offset = 10; // pixels

    var myOffset = this.depth * offset + offset;

    var css = "left: " + myOffset + "px";

    return css;
}
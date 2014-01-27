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


function updateClientMapMarker(newDocument)
{
    // pull the object from the array and update its lat lng
    clientMapMarkers[newDocument._id].setLatLng(L.latLng([newDocument.lat, newDocument.lng]));

    // this property isn't always set, so skip calling setIcon if we can
    if( typeof newDocument.clientSelected !== "undefined" ) {
        if( newDocument.clientSelected ) {
            clientMapMarkers[newDocument._id].setIcon(selectedIcon);
        } else {
            clientMapMarkers[newDocument._id].setIcon(defaultIcon);
        }
    }
}

// file scope
var selectedIcon = L.icon({
    iconUrl: 'icons/marker-icon-selected.png',
    shadowUrl: 'packages/leaflet/images/marker-shadow.png'

//    iconSize:     [38, 95], // size of the icon
//    shadowSize:   [50, 64], // size of the shadow
//    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
//    shadowAnchor: [4, 62],  // the same for the shadow
//    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

// default icon (file scope)
var defaultIcon = L.icon({
    iconUrl: 'packages/leaflet/images/marker-icon.png',
    shadowUrl: 'packages/leaflet/images/marker-shadow.png'
});

function buildLeafletMarkerFromDoc(document)
{
    var marker;
    var pos = [document.lat, document.lng];

    var markerOptions = {
        icon: defaultIcon
    };

    marker = L.marker(pos, markerOptions);

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

    // FIXME: this should be enforced server side once subscriptions are added
    doc.userId = Meteor.userId();

    doc.name = OctoNameGenerator.get({wordSet:'geo', wordTypes:['adjectives']}) + "-" + type + "-fence";


    doc.devices = [];

    Fences.insert(doc);

    // Tell server to calculate which devices are under all fences (and therefore this new one too)
    Meteor.call("serverSideProcessFences",false);
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

//    window.mapObject.options.closeOnClick = true;

    // When it's opened, meteor re-renders contents
    var popupOpened = function(event) {

        var updatedDocument = Fences.findOne(document._id);
        // (re) render popup content
        // Wrapping this with Meteor.render() seems to break clicking the same geofence twice without clicking away in-between
        popup.setContent(Template.geoFencePopup(updatedDocument));

        // call the normal popup open
        event.target._openPopup(event);

        // Bind elements in the popup
        bindFencePopupElements(updatedDocument, popup);
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
    var queryObserve;

    Deps.autorun(function() {

        if( getUserSetting('map.view.showFences') )
        {
            // this prevents re-render with 'true' twice in a row problems
            if( queryObserve )
                return;

            var query = Fences.find({});

            queryObserve = query.observe({
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
                    delete(clientFences[oldDocument._id]);
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

            // this prevents re-render with 'true' twice in a row problems
            if( queryObserve ) {
                queryObserve.stop();
            }
            queryObserve = null;
        }

    });
}

// file scope
var drawnItemsLayerGroup;

// finds devices inside a bounds object (which leaflet can generate)
findDevicesInBounds = function(bounds) {

    var north = bounds.getNorth();
    var east = bounds.getEast();
    var south = bounds.getSouth();
    var west = bounds.getWest();

    var query = {$and:[
        {lat:{$lt:north}},
        {lat:{$gt:south}},
        {lng:{$lt:east}},
        {lng:{$gt:west}}
    ]};


    var selected = Devices.find(query).fetch();

    return selected;
}

// sets a client only attribute on the Devices collection
markDevicesSelected = function(selectedDevices) {

    selectedDevices.each(function(d){

        // using _collection.update does a local update and doesn't send to server.  This is undocumented and may change
        Devices._collection.update(d._id, {$set:{clientSelected:true}});

    });

    var deviceIds = selectedDevices.map('_id');

    Devices._collection.update({clientSelected:true, _id:{$nin:deviceIds}}, {$set:{clientSelected:false}}, {multi:true});
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

    drawnMarkersLayerGroup = new L.FeatureGroup();
    window.mapObject.addLayer(drawnMarkersLayerGroup);

    // Set the title to show on the polygon button
    L.drawLocal.draw.toolbar.buttons.polygon = 'Draw a GEO fence!';
//
//
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





    var drawControlLasso = new L.Control.DrawLasso({
        position: 'topleft',
        draw: {
            polyline: false,
            polygon: false,
            rectangle: {
                onSelectCreate:function(bounds) {
                    console.log("cratedddd");
                    var selected = findDevicesInBounds(bounds);
                    markDevicesSelected(selected);
                },
                onSelectDragChange:function(bounds) {
                    var selected = findDevicesInBounds(bounds);
                    markDevicesSelected(selected);
                }
            },
            circle: false,
            marker: false
        },
        edit: false
    });
    window.mapObject.addControl(drawControlLasso);


//
//
//    var buttonControl = new L.Control.Button({
//        options: {
//            position: 'topleft',
//            text: "h"
//
//        },
//        iconUrl: "icons/row%209/8.png",
////        onAdd: function (map) {
////            // create the control container with a particular class name
////            var container = L.DomUtil.create('div', 'my-custom-control');
////
////            // ... initialize other DOM elements, add listeners, etc.
////
////            return container;
////        },
//        onClick: function (e) {
//
//            console.log(e);
//            console.log(e.target);
//
//            return null;
//        }
//    });
//
//    window.mapObject.addControl(buttonControl);










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
            var markerObject = buildLeafletMarkerFromDoc(document);

            // after calling marker.addTo (or map.addLayer(marker)) the marker object gets a new member, called _leaflet_id

            // update global array
            clientMapMarkers[document._id] = markerObject;

            drawnMarkersLayerGroup.addLayer(clientMapMarkers[document._id]);
        },
        changed: function(newDocument, oldDocument){
            updateClientMapMarker(newDocument);
        },
        removed: function(oldDocument) {
            // remove the layer from the map
            drawnMarkersLayerGroup.removeLayer(clientMapMarkers[oldDocument._id]._leaflet_id);

            // delete our record of the layer
            delete(clientMapMarkers[oldDocument._id]);
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



// Called right after a device popup is rendered and also added to the DOM
function bindDevicePopupElements(document)
{
    // ------------ select2 group search ----
    var parents = document.parents ? document.parents : [];

    // get group objects for groups that this device directly belongs to
    var belongsToGroups = Groups.find({_id: {$in: parents}}).fetch();

    var select2options = {
        multiple: true,
        placeholder: "Select groups.",
        // when the user types
        query: function (query) {

            // build regex to find text anywhere in field
            var expression = ".*"+query.term+".*";
            var rx = RegExp(expression,'i');

            // search mongo
            var documents = Groups.find({name:rx}).fetch();

            // callback is expecting a results member
            var data = {
                results: convertDocumentsSelect2(documents)
            };

            query.callback(data);
        },
        initSelection: function(element, callback) {
            // don't care what element is bc we already know

            // callback is just expecting an array
            callback(convertDocumentsSelect2(belongsToGroups));
        }
    };

    var select2groupSearchSelector = '#select2-device-popup-group-input-' + document._id;

    // shorten name
    var $select2group = $(select2groupSearchSelector);

    // build select2
    $select2group.select2(select2options);

    // WHAT IS WRONG? we need this line, but it has no data.  The data came from initSelection()
    $select2group.select2("val", []);

    // bind change
    $select2group.on("change", function(e) {
        // here e has a lot of stuff in it. including e.val which is an array of the full set
        // we only deal in deltas tho

        if( e && e.added && e.added.id ) {
            Devices.update(document._id, {$addToSet:{'parents': e.added.id}});
        }

        if( e && e.removed && e.removed.id ) {
            Devices.update(document._id, {$pull:{'parents': e.removed.id}});
        }
    });
}

// Called to bind stuff in the fence popup.  First param is the document, second is the leaflet popup object
function bindFencePopupElements(data, popupObject)
{

    $('.deleteFenceLink').off('click').on('click', function(e){
        var deleteFenceId = this.getAttribute('data-id');

        if (confirm('Are you sure you want to delete this fence?')) {
            Fences.remove(deleteFenceId);
            flashAlertMessage("Fence deleted", {hideAfter:2000});
        } else {
            // Do nothing!
        }
    });

    $('#chooseFenceColor_' + data._id).off('click').on('click', function(e){
        console.log('here');
        //Fences.update(data._id, {$set:{'layer.options.color':'#000'}});


    });


    $('#edit-fence-popup-data_' + data._id).off('click').on('click', function(e){

        // re-fetch the document because it may have changed since we bound the popup to the fences

        var updatedData = Fences.findOne(data._id);
        //Disable the click close of the popup

//        Session.set("fencePopupEditingId", data._id);

        // This should switch everything inside the popup to edit mode

       //HIDE HERE
        $('#edit-fence-popup-data_' + data._id).hide();

        $('.showWithEditFencePopup_' + updatedData._id).removeClass('hidden');


        var prevColor = updatedData.layer.options.color;
        var currentColor = prevColor;
        console.log(prevColor);


        var cp = ColorPicker(document.getElementById('slide'), document.getElementById('picker'),
            function(hex, hsv, rgb, mousePicker, mouseSlide) {

                ColorPicker.positionIndicators(
                    document.getElementById('slide-indicator'),
                    document.getElementById('picker-indicator'),
                    mouseSlide, mousePicker
                );
                currentColor = hex;
                Fences._collection.update(data._id, {$set:{'layer.options.color':currentColor}});
                $('#chooseFenceColor_' + data._id).css('background-color', currentColor);
            });

        $('#saveFenceColor_' + data._id).off('click').on('click', function(e){
            console.log('save');
            prevColor = currentColor;
            Fences.update(data._id, {$set:{'layer.options.color':currentColor}});
            $('.showWithEditFencePopup_' + data._id).addClass('hidden');
            $('svg').slice(1).remove();
            $('#edit-fence-popup-data_' + data._id).show();
        });

        $('#cancelFenceColor_' + data._id).off('click').on('click', function(e){
            console.log('cancel');
            Fences._collection.update(data._id, {$set:{'layer.options.color':prevColor}});
            $('#chooseFenceColor_' + data._id).css('background-color', prevColor);
            $('.showWithEditFencePopup_' + data._id).addClass('hidden');
            $('svg').slice(1).remove();
            $('#edit-fence-popup-data_' + data._id).show();
        });

    });




}

Template.leftPanelGroup.collapsedClass = function() {
    if(this.groupExpanded) {
        return "mjs-nestedSortable-expanded";
    } else {
        return "mjs-nestedSortable-collapsed";
    }
}

Template.leftPanelGroup.rendered = function() {
    // toggles groups on left
    $('.left-disclose').off('click').on('click', function() {

        var $li = $(this).closest('li');
        var id = $li.attr('data-id');

        if(  $li.hasClass('mjs-nestedSortable-expanded') ) {
            removeFromSetUserSetting('map.view.expandedGroups', id);
        } else {
            addToSetUserSetting('map.view.expandedGroups', id);
        }
    });
}

// This has global scope because there is no var.
// call .changed() on this to re-render the left panel.
leftPanelRerenderDependency = new Deps.Dependency();

// just here to allow us to re-render the template at will
Template.leftPanelGroups.dependenciesString = function() {
    leftPanelRerenderDependency.depend();
    return "";
}

Template.leftPanelGroup.eyeIconClass = function() {
    if(this.groupVisible) {
        return "fa-eye";
    } else {
        return "fa-eye-slash";
    }
}

Template.leftPanelGroup.occludedClass = function() {
    // subscribe.js calculates an array we need, and notifies us when it changes
    clientOccludedGroupsDep.depend();

    if( clientOccludedGroups && clientOccludedGroups.indexOf(this._id) !== -1 ) {
        return "";
    } else {
        return "occludedGroup";
    }
}

Template.leftPanelGroups.rendered = function() {

    var eyeballLeftOffset = 8;

    $(".groupListEyeball").each(function() {
        $this = $(this);
        var id = $this.attr('data-id');

        // the eyeball's left position is glued to the left side of the pane
        var pos = $this.offset();
        pos.left = eyeballLeftOffset;

        // the top position is glued to the same offset as the li for this group
        pos.top = $("#groupList_" + id).offset().top;

        $this.offset(pos);
    });

    // handles click and toggles eyeballs on/off
    $('.groupListEyeball').off('click').on('click', function() {
        var $this = $(this);
        var $eye = $this.find('.actual-eyeball-class');
        var id = $this.attr('data-id');

        // clicking on the eye only updates the database, then the template re-render changes the font awesome icon
        if( $eye.hasClass('fa-eye') ) {
//            $eye.removeClass('fa-eye').addClass('fa-eye-slash');
            removeFromSetUserSetting('map.view.visibleGroups', id);
        } else {
//            $eye.removeClass('fa-eye-slash').addClass('fa-eye');
            addToSetUserSetting('map.view.visibleGroups', id);
        }

    });
}

Template.leftPanelGroups.groups = function() {
    var flatGroups = Groups.find().fetch();

    if( !Meteor.user() ) {
        return [];
    }

    var profile = Meteor.user().profile;

    // look at each group, set this member variable if the group is visible to the current user
    flatGroups.each(function(g) {
        if( profile && profile.map && profile.map.view && profile.map.view.visibleGroups && profile.map.view.visibleGroups.indexOf(g._id) != -1 ) {
            g.groupVisible = true;
        } else {
            g.groupVisible = false;
        }

        // set this member variable if group is expanded
        if( profile && profile.map && profile.map.view && profile.map.view.expandedGroups && profile.map.view.expandedGroups.indexOf(g._id) != -1 ) {
            g.groupExpanded = true;
        } else {
            g.groupExpanded = false;
        }
    });

    var heirarchy = buildDocumentHeirarchy(flatGroups);

    return heirarchy;
}


Template.leftPanelGroup.deviceCount = function() {
    return this.devicesInGroupCount;
}

// Search for events that apply to this device.  Note that we don't call .find().fetch().length, instead use .find().count();
Template.devicePopup.deviceFenceEvents = function () {
    return Events.find({type:"deviceFence","event.deviceId":this._id}).count();;;;
}

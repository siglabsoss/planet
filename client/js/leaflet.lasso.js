// RectangleLasso is a copy of L.Draw.Rectangle
// this is basically a copy of the entire class with the same extension pattern as the original
L.Draw.RectangleLasso = L.Draw.SimpleShape.extend({
    statics: {
        TYPE: 'rectangle'
    },

    options: {
        shapeOptions: {
            stroke: true,
            dashArray: [5, 5], // specify the length of the dashed array
            lineCap: "square", // make dash edges square
            color: '#333333',
            weight: 3,
            opacity: 1.0,
            fill: false,
            fillColor: null, //same as color by default
            fillOpacity: 0,
            clickable: false
        },
        onSelectDragChange:function(bounds) {
            var print = "drag: ";
            [bounds.getNorthWest(), bounds.getNorthEast(), bounds.getSouthEast(), bounds.getSouthWest()].each(function(c){
                print = print + '[' + c.lat + ', ' + c.lng + '] '
            });
            console.log(print);
        },
        onSelectCreate:function(bounds) {
            console.log('selection created');
        },
        fireNormalCreatedEvent: false
    },

    initialize: function (map, options) {
        // Save the type so super can fire, need to do this as cannot do this.TYPE :(
        this.type = L.Draw.Rectangle.TYPE;

        this._initialLabelText = L.drawLocal.draw.handlers.rectangle.tooltip.start;

        L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
    },

    _drawShape: function (latlng) {
        if (!this._shape) {
            this._shape = new L.Rectangle(new L.LatLngBounds(this._startLatLng, latlng), this.options.shapeOptions);
            this._map.addLayer(this._shape);
        } else {
            this._shape.setBounds(new L.LatLngBounds(this._startLatLng, latlng));
        }

        this.options.onSelectDragChange.call(this, this._shape.getBounds());
    },

    _fireCreatedEvent: function () {
        if( this.options. fireNormalCreatedEvent ) {
            var rectangle = new L.Rectangle(this._shape.getBounds(), this.options.shapeOptions);
            L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, rectangle);
        }

        this.options.onSelectCreate.call(this, this._shape.getBounds());
    }
});

// DrawToolbarLasso is a copy of L.DrawToolbar
// Here we extend the class we are copying, and then only provide minimal overides
L.DrawToolbarLasso = L.DrawToolbar.extend({

    options: {
        polyline: {},
        polygon: {},
        rectangle: {},
        circle: {},
        marker: {}
    },

//    initialize: function (options) {
//        // Ensure that the options are merged correctly since L.extend is only shallow
//        for (var type in this.options) {
//            if (this.options.hasOwnProperty(type)) {
//                if (options[type]) {
//                    options[type] = L.extend({}, this.options[type], options[type]);
//                }
//            }
//        }
//
//        this._toolbarClass = 'leaflet-draw-draw';
//        L.Toolbar.prototype.initialize.call(this, options);
//    },

    getModeHandlers: function (map) {
        return [
//            {
//                enabled: this.options.polyline,
//                handler: new L.Draw.Polyline(map, this.options.polyline),
//                title: L.drawLocal.draw.toolbar.buttons.polyline
//            },
//            {
//                enabled: this.options.polygon,
//                handler: new L.Draw.Polygon(map, this.options.polygon),
//                title: L.drawLocal.draw.toolbar.buttons.polygon
//            },
            {
                enabled: this.options.rectangle,
                handler: new L.Draw.RectangleLasso(map, this.options.rectangle),
                title: "Drag to select"
            }
//            ,
//            {
//                enabled: this.options.circle,
//                handler: new L.Draw.Circle(map, this.options.cicle),
//                title: L.drawLocal.draw.toolbar.buttons.circle
//            },
//            {
//                enabled: this.options.marker,
//                handler: new L.Draw.Marker(map, this.options.marker),
//                title: L.drawLocal.draw.toolbar.buttons.marker
//            }
        ];
    }
//    ,

//    // Get the actions part of the toolbar
//    getActions: function (handler) {
//        return [
//            {
//                enabled: handler.deleteLastVertex,
//                title: L.drawLocal.draw.toolbar.undo.title,
//                text: L.drawLocal.draw.toolbar.undo.text,
//                callback: handler.deleteLastVertex,
//                context: handler
//            },
//            {
//                title: L.drawLocal.draw.toolbar.actions.title,
//                text: L.drawLocal.draw.toolbar.actions.text,
//                callback: this.disable,
//                context: this
//            }
//        ];
//    },
//
//    setOptions: function (options) {
//        L.setOptions(this, options);
//
//        for (var type in this._modes) {
//            if (this._modes.hasOwnProperty(type) && options.hasOwnProperty(type)) {
//                this._modes[type].handler.setOptions(options[type]);
//            }
//        }
//    }
});


// DrawLasso is a copy of L.Control.Draw
// this is basically a copy of the entire class with the same extension pattern as the original
L.Control.DrawLasso = L.Control.extend({

    options: {
        position: 'topleft',
        draw: {},
        edit: true
    },

    initialize: function (options) {
        if (L.version < '0.7') {
            throw new Error('Leaflet.draw 0.2.3+ requires Leaflet 0.7.0+. Download latest from https://github.com/Leaflet/Leaflet/');
        }

        L.Control.prototype.initialize.call(this, options);

        var id, toolbar;

        this._toolbars = {};

        // Initialize toolbars
        if (L.DrawToolbar && this.options.draw) {
            toolbar = new L.DrawToolbarLasso(this.options.draw);
//            toolbar._toolbarClass = "myClassPrefix2"; // this plus a css rule can select the icon
            id = L.stamp(toolbar);
            this._toolbars[id] = toolbar;

            // Listen for when toolbar is enabled
            this._toolbars[id].on('enable', this._toolbarEnabled, this);

            if( this.options.draw && this.options.draw.rectangle && this.options.draw.rectangle.onToolEnabled && $.isFunction(this.options.draw.rectangle.onToolEnabled) ) {
                this._toolbars[id].on('enable', this.options.draw.rectangle.onToolEnabled, this);
            }

            if( this.options.draw && this.options.draw.rectangle && this.options.draw.rectangle.onToolDisabled && $.isFunction(this.options.draw.rectangle.onToolDisabled) ) {
                this._toolbars[id].on('disable', this.options.draw.rectangle.onToolDisabled, this);
            }
        }

        if (L.EditToolbar && this.options.edit) {
            toolbar = new L.EditToolbar(this.options.edit);
            id = L.stamp(toolbar);
            this._toolbars[id] = toolbar;

            // Listen for when toolbar is enabled
            this._toolbars[id].on('enable', this._toolbarEnabled, this);
        }
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-draw'),
            addedTopClass = false,
            topClassName = 'leaflet-draw-toolbar-top',
            toolbarContainer;

        for (var toolbarId in this._toolbars) {
            if (this._toolbars.hasOwnProperty(toolbarId)) {
                toolbarContainer = this._toolbars[toolbarId].addToolbar(map);

                if (toolbarContainer) {
                    // Add class to the first toolbar to remove the margin
                    if (!addedTopClass) {
                        if (!L.DomUtil.hasClass(toolbarContainer, topClassName)) {
                            L.DomUtil.addClass(toolbarContainer.childNodes[0], topClassName);
                        }
                        addedTopClass = true;
                    }

                    container.appendChild(toolbarContainer);
                }
            }
        }

        return container;
    },

    onRemove: function () {
        for (var toolbarId in this._toolbars) {
            if (this._toolbars.hasOwnProperty(toolbarId)) {
                this._toolbars[toolbarId].removeToolbar();
            }
        }
    },

    setDrawingOptions: function (options) {
        for (var toolbarId in this._toolbars) {
            if (this._toolbars[toolbarId] instanceof L.DrawToolbar) {
                this._toolbars[toolbarId].setOptions(options);
            }
        }
    },

    _toolbarEnabled: function (e) {
        var id = '' + L.stamp(e.target);

        for (var toolbarId in this._toolbars) {
            if (this._toolbars.hasOwnProperty(toolbarId) && toolbarId !== id) {
                this._toolbars[toolbarId].disable();
            }
        }

//        console.log('clicked');
    }
});
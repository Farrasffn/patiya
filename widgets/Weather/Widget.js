define(['dojo/_base/declare',
    "dojo/dom",
    'dojo/parser',
    "dojo/dom-construct",
    'dijit/_WidgetsInTemplateMixin',
    "esri/graphic",
    'esri/layers/GraphicsLayer',
    "esri/geometry/Geometry",
    "esri/SpatialReference",
    "esri/symbols/PictureMarkerSymbol",
    'dojo/_base/lang',
    "esri/tasks/locator",
    "esri/geometry/Point",
    "esri/geometry/webMercatorUtils",
    "esri/dijit/PopupTemplate",
    'dijit/form/TextBox',
    'dijit/form/Button',
    'dijit/Tooltip',
    "jimu/WidgetManager",
    'jimu/BaseWidget'
],
function (declare, dom, parser, domConstruct, _WidgetsInTemplateMixin, Graphic, GraphicsLayer, Geometry, SpatialReference, PictureMarkerSymbol,
 lang, Locator, Point, webMercatorUtils, PopupTemplate, TextBox, Button, Tooltip, WidgetManager, BaseWidget) {
    var graphic;
    var clazz = declare([BaseWidget,_WidgetsInTemplateMixin], {

        name: "Weather",
        baseClass: 'jimu-widget-weather',
        pmc:null,
        mapPinsGraphicsLayer:null,
        
        onOpen: function () {
            //GeoNet post: https://geonet.esri.com/thread/181865-how-to-change-wab-widget-window-size
            //Resize the Panel when opened, removed resize problem with tab theme? 2.x ?
            var panel = this.getPanel();
            panel.position.width = 600;
            panel.setPosition(panel.position);
            panel.panelManager.normalizePanel(panel);
        },
        
        startup: function() {
          this.inherited(arguments);
          var symUrl = this.folderUrl + "images/Location_Icon.png";
          pmc = new PictureMarkerSymbol({//symbols from the symbol selector seem smaller than what we define here, so for 24 we set to 8
            "url": symUrl,
            "width": 18,
            "height": 18,
            "angle": 0,
            "xoffset": 0,
            "yoffset": 10
          });
          this.map.on("click", lang.hitch(this, this.onMapClick));
          this.mapPinsGraphicsLayer = new GraphicsLayer();
          this.map.addLayer(this.mapPinsGraphicsLayer);
          this.mapPinsGraphicsLayer.visible=true;
          this._getUserLocation();
        },
        
        onMapClick: function(evt){
          if(this.state === "active" || this.state === "opened"){
            var mpGeo = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
            this.weatherMapLat.set("value", mpGeo.y.toFixed(6));
            this.weatherMapLon.set("value", mpGeo.x.toFixed(6));
          }
        },      
        
        weatherMapClickAction: function(){
          this.mapPinsGraphicsLayer.clear();
          var latNum = Number(this.weatherMapLat.get("value"));
          var lonNum = Number(this.weatherMapLon.get("value"));
          if(isNaN(latNum) || isNaN(lonNum))return;
          var position = {coords:{latitude:latNum, longitude:lonNum}};
          domConstruct.destroy("weatherFrame");
          domConstruct.place("<iframe id='weatherFrame' style='display:none; width:100%; height:100%;'></iframe>", "wxFrameContainer", "only");
          var wxFrame = dom.byId("weatherFrame");
          wxFrame.src = 'https://forecast.weather.gov/MapClick.php?lat=' + latNum + '&lon=' + lonNum;
          wxFrame.style.display = 'inline';
          wxFrame.onload = lang.hitch(this, function() {
              var pt = webMercatorUtils.geographicToWebMercator(new Point(position.coords.longitude, position.coords.latitude));
              graphic = new Graphic(new Point(pt, this.map.extent.spatialReference), pmc, null);
              var grahpicPopup = new PopupTemplate({
                  title: "Local Weather Info",
                  fieldInfos: [
                            { fieldName: "NWS_Link", visible: true, label: "NWS Link:"},
                            { fieldName: "Latitude", visible: true, label: "Latitude:"},
                            { fieldName: "Longitude", visible: true, label: "Longitude:"}
                  ]
              });
              graphic.setAttributes({ "NWS_Link": wxFrame.src, "Latitude": position.coords.latitude, "Longitude": position.coords.longitude });
              graphic.setInfoTemplate(grahpicPopup);
              console.log(graphic);
              this.mapPinsGraphicsLayer.add(graphic);
              this.map.centerAndZoom(pt, 15);
          })
        },
        
        coordinateEntry : function(event){
          //TODO allow user entry not just on map click
        },


        _getUserLocation: function () {
            var thePanel = this.getPanel();
            console.log(thePanel);
            if (thePanel.state !== "closed") {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(lang.hitch(this, this._applyPosition));
                } else {
                    var errorMsg = dom.byId("noLocate");
                    errorMsg.style.display = inline;
                }
            }
        },
        _applyPosition: function (position) {
            var wxFrame = dom.byId("weatherFrame");
            wxFrame.src = 'https://forecast.weather.gov/MapClick.php?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude;
            wxFrame.style.display = 'inline';
            wxFrame.onload = lang.hitch(this, function() {
                var pt = webMercatorUtils.geographicToWebMercator(new Point(position.coords.longitude, position.coords.latitude));
                graphic = new Graphic(new Point(pt, this.map.extent.spatialReference), pmc, null);
                var grahpicPopup = new PopupTemplate({
                    title: "Local Weather Info",
                    fieldInfos: [
                              { fieldName: "NWS_Link", visible: true, label: "NWS Link:"},
                              { fieldName: "Latitude", visible: true, label: "Latitude:"},
                              { fieldName: "Longitude", visible: true, label: "Longitude:"}
                    ]
                });
                graphic.setAttributes({ "NWS_Link": wxFrame.src, "Latitude": position.coords.latitude, "Longitude": position.coords.longitude });
                graphic.setInfoTemplate(grahpicPopup);
                this.map.centerAndZoom(pt, 15);
                this.mapPinsGraphicsLayer.add(graphic);
            })
        },
        onClose: function () {
            this.mapPinsGraphicsLayer.remove(graphic);
            var thePanel = this.getPanel();
            console.log(thePanel);
        }
    });
    return clazz;
});



/*global define*/
define(
  ['dojo/_base/declare',
    'dojo/_base/lang',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidgetSetting',
    'dojo/text!./WKIDEdit.html',
    'dojo/request',
    'esri/SpatialReference',
  ],
  function(
    declare,
    lang,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    BaseWidgetSetting,
    template,
    dojoRequest,
    SpatialReference
    ) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      baseClass: 'symbology-edit',
      templateString: template,
      config: null,
      nls: null,
      currentWkid: null,
      popup: null,
      spatialRefs: null,
      widget: null,

      postCreate: function() {
        this.inherited(arguments);
        this.spatialRefs = dojoRequest(this.widget.folderUrl + 'setting/cs.json', {
          handleAs: "json"
        });
      },

      startup: function() {
        this.inherited(arguments);
        if(!this.config){
          this.popup.disableButton(0);
        }
        this.setConfig(this.config);
      },

      setConfig:function(config){
        this.config = config;
        if(!this.config){
          return;
        }
        this.spatialRefs.then(lang.hitch(this, function(results){
          this.spatialRefs = results;
          if (this.config && this.config.wkid) {
            this.wkid.set('value', parseInt(this.config.wkid, 10));
          }
        }));
      },

      getConfig: function() {
        var config = {
          wkid: this.standardizeWkid(this.wkid.get('value'))
        };
        this.config = config;
        return this.config;
      },

      standardizeWkid: function(wkid) {
        return this.isWebMercator(wkid) ? 3857 : parseInt(wkid, 10);
      },

      isWebMercator: function(wkid) {
        // true if this spatial reference is web mercator
        if (SpatialReference.prototype._isWebMercator) {
          return SpatialReference.prototype._isWebMercator.apply({
            wkid: parseInt(wkid, 10)
          }, []);
        } else {
          var sr = new SpatialReference(parseInt(wkid, 10));
          return sr.isWebMercator();
        }
      },

      isValidWkid: function(wkid) {
        return this.indexOfWkid(wkid) > -1;
      },

      indexOfWkid: function(wkid) {
        return this.spatialRefs.wkids.indexOf(wkid);
      },

      getSRLabel: function(wkid) {
        if (this.isValidWkid(wkid)) {
          var i = this.indexOfWkid(wkid);
          return this.spatialRefs.labels[i].toString().replace(/_/g, ' ');
        }
      },

      onWkidChange: function(newValue) {
        var label = "",
          newWkid = parseInt(newValue, 10);

        this.popup.disableButton(0);

        if (this.isValidWkid(newWkid)) {
          label = this.getSRLabel(newWkid);
          this.wkidLabel.innerHTML = label.split("_").join(" ");
          this.popup.enableButton(0);
        } else if (newValue) {
          this.wkid.set('value', "");
          this.wkidLabel.innerHTML = this.nls.cName;
        }
        this.currentWkid = newWkid;
      }
    });
  });

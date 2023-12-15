///////////////////////////////////////////////////////////////////////////
// Segment Chooser Dijit
// By: Robert Scheitlin
///////////////////////////////////////////////////////////////////////////
/*global define, document, window, setTimeout*/
/*jslint maxlen: 800, -W116 */
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/on',
  'dojo/has',
  './MobilePopup',
  'dojo/dom',
  'dojo/dom-construct',
  'dojo/dom-style',
  'dojo/dom-class',
  'dojo/dom-attr',
  'dojo/_base/array',
  'dojo/Evented',
  'esri/graphic',
  'esri/SpatialReference',
  'esri/geometry/Polyline',
  'dojo/sniff'
  ],
  function(declare, lang, html, on, has, MobilePopup, dom, domConstruct, domStyle, domClass, domAttr, 
    array, Evented, Graphic, SpatialReference, Polyline) {
    return declare([MobilePopup, Evented], {
      //summary:
      //  show the Relate Chooser

      baseClass: 'jimu-popup jimu-message',
      declaredClass: 'eProfile.dijit.segment.chooser',

      //type: String
      //  the popup messge type, can be: message/question/error
      type: 'message',

      //type:String
      message: '',

      autoHeight: false,
      segmentsArr: null,
      folderurl: null,
      maxWidth: 400,
      maxHeight: 400,
      nls: null,
      pWidget: null,

      postMixInProperties: function() {
        this.inherited(arguments);
      },

      _dataMixin: function(){
        this._listContainer = domConstruct.create("div");
        domClass.add(this._listContainer, "segment-list-container");
        this.own(on(this._listContainer, "click", lang.hitch(this, this._onClick)));
        this.own(on(document, ".segment-list-item:mouseover", lang.hitch(this, this._onMouseOver)));
        this.own(on(document, ".segment-list-item:mouseout", lang.hitch(this, this._onMouseOut)));
        domConstruct.place(this._listContainer, this.contentContainerNode);

        array.map(this.segmentsArr, lang.hitch(this, function(segment, index){
          // console.info(segment);
          var div = domConstruct.create("div");
          domAttr.set(div, "id", index);

          var iconDiv = domConstruct.create("div");
          domAttr.set(iconDiv, "id", index);
          domClass.add(iconDiv, "iconDiv");
          domConstruct.place(iconDiv, div);

          var sImg = domConstruct.toDom("<img src='" + this.folderurl + "images/i_segment.png' alt='' border='0' width='20px' height='20px'>");
          domConstruct.place(sImg, iconDiv);

          var sTitle = domConstruct.create("p");
          domAttr.set(sTitle, "id", index);
          domClass.add(sTitle, "_title");
          sTitle.textContent = sTitle.innerText = this.nls.polyPath + " " + (index + 1);
          domConstruct.place(sTitle, div);
          domClass.add(div, "segment-list-item");
          domConstruct.place(div, this._listContainer);
        }));
      },

      _onClick: function(evt) {
        if (evt.target.id === "" && evt.target.parentNode.id === "") {
          return;
        }
        this.pWidget.eFeatGL.clear();
        var id = evt.target.id.toLowerCase();
        if (!id) {
          id = evt.target.parentNode.id;
        }
        this._selectedNode = id;
        this.emit('click', id);
        this.close();
      },

      _onMouseOver: function(evt){
        if (evt.target.id === "" && evt.target.parentNode.id === "") {
          return;
        }
        var id = evt.target.id.toLowerCase();
        if (!id) {
          id = evt.target.parentNode.id;
        }
        var pLine = new Polyline(new SpatialReference({wkid:102100}));
        pLine.addPath(this.segmentsArr[id]);
        var sfGra = new Graphic(pLine, this.pWidget.map.infoWindow.lineSymbol);
        this.pWidget.eFeatGL.add(sfGra);
      },

      _onMouseOut: function(evt){
        this.pWidget.eFeatGL.clear();
      },

      _createTitleNode: function(){
        if (this.titleLabel) {
          this.titleNode = html.create('div', {
            'class': 'title'
          }, this.domNode);
          this.handleNode = html.create('div', {
            'class': 'handle'
          }, this.titleNode);
          this.titleLabeNode = html.create('span', {
            'class': 'title-label jimu-float-leading',
            innerHTML: this.titleLabel || '&nbsp'
          }, this.titleNode);
          this.closeBtnNode = html.create('div', {
            'class': 'close-btn jimu-icon jimu-icon-close jimu-float-trailing',
          }, this.titleNode);
          this.own(on(this.closeBtnNode, 'click', lang.hitch(this, this.close)));
        }
      },

      _increaseZIndex: function() {
        html.setStyle(this.domNode, 'zIndex', 9999);
        html.setStyle(this.overlayNode, 'zIndex', 9998);
      }
    });
  });

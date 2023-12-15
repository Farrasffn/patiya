define([
  'dojo/_base/declare',
  'jimu/BaseFeatureAction',
  'jimu/WidgetManager'
], function(declare, BaseFeatureAction, WidgetManager){
  var clazz = declare(BaseFeatureAction, {
    iconFormat: 'png',

    isFeatureSupported: function(featureSet){
      return featureSet.features.length > 0 && featureSet.features[0].geometry && featureSet.features[0].geometry.type === 'polyline';
    },

    onExecute: function(featureSet){
      WidgetManager.getInstance().triggerWidgetOpen(this.widgetId)
      .then(function(myWidget) {
        myWidget.openWidgetandProfileLine(featureSet.features[0]);
      });
    }

  });
  return clazz;
});

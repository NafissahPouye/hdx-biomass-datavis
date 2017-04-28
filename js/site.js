function generateringComponent(vardata, vargeodata){

  var lookup = genLookup(vargeodata) ;

  var biomass_chart = dc.lineChart('#sahel-biomasse-bar');
  var sahelBioMap = dc.leafletChoroplethChart('#sahel-biomasse-map');

  var cf = crossfilter(vardata) ;
  var all = cf.groupAll();

  var barDimension = cf.dimension(function(d) { return d.year}) ;
  var mapDimension = cf.dimension(function(d) { return d.rowcacode2});

  var barGroup = barDimension.group().reduceSum(function(d){ return d.biomass/1000});
  var mapGroup = mapDimension.group().reduceSum(function(d){ return d.biomass});

  biomass_chart.width(350)
               .height(450)
               .dimension(barDimension)
               .group(barGroup)
               .x(d3.scale.linear().domain([1998, 2016]))
               .renderArea(false)
               .renderHorizontalGridLines(true)
               .renderVerticalGridLines(true)
               .elasticX(true)
               .colors('#03a9f4')
               .colorAccessor(function(d,i){ return 0;});
               //.xAxis().ticks(5);

dc.dataCount('#count-info')
  .dimension(cf)
  .group(all);


  sahelBioMap.width(450)
             .height(450)
             .dimension(mapDimension)
             .group(mapGroup)
             
             .center([0,0])
             .zoom(0)
             .geojson(vargeodata)
             .colors(['#CCCCCC','#03a9f4'])
             .colorDomain([0,1])
             .colorAccessor(function (d){
               if (d>0) {
                 return 1;
               } else {
                 return 0;
               }
             })
             .featureKeyAccessor(function (feature){
               return feature.properties['rowcacode2'];
             }).popup(function (d){
               return lookup[d.key];
             })
             .renderPopup(true);

      dc.renderAll();

      var map = sahelBioMap.map();

      zoomToGeom(vargeodata);

      function zoomToGeom(geodata){
        var bounds = d3.geo.bounds(geodata) ;
        map.fitBounds([[bounds[0][1],bounds[0][0]],[bounds[1][1],bounds[1][0]]]);
      }

      function genLookup(geojson) {
        var lookup = {} ;
        geojson.features.forEach(function (e) {
          lookup[e.properties['rowcacode2']] = String(e.properties['adm2']);
        });
        return lookup ;
      }
}

var dataCall = $.ajax({
    type: 'GET',
    url: 'data/biomass.json',
    dataType: 'json',
});
// var dataCall = $.ajax({
//     type: 'GET',
//     url: 'data/biomasse.csv',
//     dataType: 'csv',
// });

var geomCall = $.ajax({
    type: 'GET',
    url: 'data/bio-wa.geojson',
    dataType: 'json',
});


$.when(dataCall, geomCall).then(function(dataArgs, geomArgs){
    var geom = geomArgs[0];
    geom.features.forEach(function(e){
        e.properties['rowcacode2'] = String(e.properties['rowcacode2']);
    });
    generateringComponent(dataArgs[0],geom);
});

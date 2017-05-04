function generateringComponent(vardata, vargeodata){

  var lookup = genLookup(vargeodata) ;

  var biomass_chart = dc.lineChart('#biomassChart');
  var anomalychoroplethmap = dc.leafletChoroplethChart('#anomalyMap');

  var cf = crossfilter(vardata) ;
  var all = cf.groupAll();

  var chartDimension = cf.dimension(function(d) { return d.year}) ;
  var mapDimension = cf.dimension(function(d) { return d.rowcacode2});

  var chartGroup = chartDimension.group().reduceSum(function(d){ return d.biomass});
  var mapGroup = mapDimension.group().reduceSum(function(d){ return d.anomalie});

  biomass_chart.width(350)
               .height(450)
               .dimension(chartDimension)
               .group(chartGroup)
               .x(d3.scale.linear().domain([1998, 2016]))
               .renderArea(false)
               .margins({top: 20, right: 0, bottom: 30, left: 80})
               .renderHorizontalGridLines(true)
               .renderVerticalGridLines(true)
               .elasticY(true)
               .colors('#03a9f4')
               .colorAccessor(function(d,i){ return 0;});
               //.xAxis().ticks(5);

dc.dataCount('#count-info')
  .dimension(cf)
  .group(all);


 anomalychoroplethmap.width(450)
             .height(450)
             .dimension(mapDimension)
             .group(mapGroup)
             .center([0,0])
             .zoom(0)
             .geojson(vargeodata)
             .colors(['#DDDDDD','#A7C1D3','#71A5CA','#3B88C0', '#FF0080'])
             .colorDomain([0,4])
             .colorAccessor(function (d){
               var c =0
                if(d>100){
                    c=4;
                } else if (d>130) {
                    c=3;
                } else if (d>3260017.488) {
                    c=2;
                } else if (d>1738737.528) {
                    c=1;
                };
                return c
                
            })         
             .featureKeyAccessor(function (feature){
               return feature.properties['Rowcacode2'];
<<<<<<< HEAD
=======
             }).popup(function (d){
               return lookup[d.key];
>>>>>>> 46ef062bdf3a797deebad95b4c4faa62ae9d21f1
             })
            .popup(function (d){
               return d.properties['ADM2_NAME'];//+" : "+d.properties['ANOMALIE'];//feature.properties['ADM2_NAME'];
              })
             .renderPopup(false);

      dc.renderAll();

      var map = anomalychoroplethmap.map();

      zoomToGeom(vargeodata);

      function zoomToGeom(geodata){
        var bounds = d3.geo.bounds(geodata) ;
        map.fitBounds([[bounds[0][1],bounds[0][0]],[bounds[1][1],bounds[1][0]]]);
      }

      function genLookup(geojson) {
        var lookup = {} ;
        geojson.features.forEach(function (e) {
          lookup[e.properties['Rowcacode2']] = String(e.properties['NAME']);
        });
        return lookup ;
      }
}

var dataCall = $.ajax({
    type: 'GET',
    url: 'data/biomass.json',
    dataType: 'json',
});

var geomCall = $.ajax({
    type: 'GET',
    url: 'data/biomasse.geojson',
    dataType: 'json',
});


$.when(dataCall, geomCall).then(function(dataArgs, geomArgs){
    var geom = geomArgs[0];
    geom.features.forEach(function(e){
        e.properties['rowcacode2'] = String(e.properties['rowcacode2']);
    });
    generateringComponent(dataArgs[0],geom);
});

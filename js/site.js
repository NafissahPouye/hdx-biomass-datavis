function generateringComponent(vardata, vargeodata){

  var lookup = genLookup(vargeodata) ;

  var biomass_chart = dc.lineChart('#biomassChart');
  var anomalychoroplethmap = dc.leafletChoroplethChart('#anomalyMap');

  var cf = crossfilter(vardata) ;
  var all = cf.groupAll();

  var chartDimension = cf.dimension(function(d) { return d.year}) ;
  var mapDimension = cf.dimension(function(d) { return d.rowcacode2});

  var chartGroup = chartDimension.group().reduceSum(function(d){ return d.biomass/1000});
  var mapGroup = mapDimension.group().reduceSum(function(d){ return d.anomalie});

  biomass_chart.width(550)
               .height(500)
               .dimension(chartDimension)
               .group(chartGroup)
               .x(d3.scale.linear().domain([1998, 2016]))
               .renderArea(true)
               .margins({top: 10, right: 13, bottom: 80, left: 80})
               .renderHorizontalGridLines(true)
               .renderVerticalGridLines(true)
               .elasticY(true)
               .colors('#03a9f4')
               .colorAccessor(function(d,i){ return 0;})
              .renderlet(function (chart) {
                    chart.selectAll("g.x text")
                      .attr('dx', '-12')
                      .attr('transform', "rotate(-60)");
                })
               .xAxis().tickFormat(d3.format("d"));
               //.yAxis().tickFormat(d3.format("d"));


dc.dataCount('#count-info')
  .dimension(cf)
  .group(all);


 anomalychoroplethmap.width($('#anomalyMap'))
             .height(500)
             .dimension(mapDimension)
             .group(mapGroup)
             .center([0,0])
             .zoom(0)
             .geojson(vargeodata)
             .colors(['#CEF6CE','#F5DA81', '#58FAAC', '#01DF3A'])
             //.colors(['#334605','#DDDDDD','#C59512','#EFB412','#B2F013' ,'#DDDDDD'])
             .colorDomain([0,3])
             .colorAccessor(function (d){
               var c =0
                if(d<110){
                    c=  1;
                } else if (d>=110& d<150) {
                    c=2;
                } else if (d>=150) {
                    c=3;
                } 
                return c
                
            })         
             .featureKeyAccessor(function (feature){
               return feature.properties['Rowcacode2'];
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

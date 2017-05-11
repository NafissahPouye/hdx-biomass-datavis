function generateringComponent(vardata, vargeodata){

  var lookup = genLookup(vargeodata) ;

  var biomass_chart = dc.compositeChart('#biomassChart');
  var anomalychoroplethmap = dc.leafletChoroplethChart('#anomalyMap');

  var cf = crossfilter(vardata) ;
  var all = cf.groupAll();
  var chartDimension = cf.dimension(function(d) { return d.year}) ;
  var mapDimension = cf.dimension(function(d) { return d.rowcacode2});
  var chartGroup = chartDimension.group().reduceSum(function(d){ return d.biomass/1000});
  var meanGroup = chartDimension.group().reduceSum(function(d){return d.mean/1000});
  var mapGroup = mapDimension.group().reduceSum(function(d){ return d.anomalie});
  var colors = ['#A7C1D3',' #008080'];
  var numberFormat = d3.format('.2f');

  //begin test
 /* ctx.font = font;
        var longest = 0;
        each(arrayOfStrings,function(string){
        var textWidth = ctx.measureText(string).width;
        var textWidth = ctx.measureText(string).width * 1.05;
          longest = (textWidth > longest) ? textWidth : longest;
        });
        return longest;*/


  //end test
 
  biomass_chart.width(567)
               .height(520)
               .dimension(chartDimension)
               .x(d3.scale.linear().domain([1997, 2016]))
               .legend(dc.legend().x($('#biomassChart').width()-80).y(0).gap(3))
               .shareTitle(false)
               .valueAccessor(function(p) {
                return p.value;
            })
               .compose([
                 dc.lineChart(biomass_chart).group(meanGroup, "Moyenne").colors(colors[1]).title(function (p) {
                   return ["Année      : " + p.key , "Moyenne : " + numberFormat(p.value) + " k" ].join('\n'); }).renderArea(true),
                  dc.lineChart(biomass_chart).group(chartGroup, "Production").colors(colors[0]).title(function (p) {
                   return ["Année         : " + p.key , "Production : " + numberFormat(p.value) + " k" ].join('\n'); }).renderArea(true),
                 
                ])
               .label(function (p) { return p.key; })
               .title(function (d) {
                   return ["Année      : " + d.key , "Biomasse : " + d.value + " k" ].join('\n'); })
               .margins({top: 10, right: 30, bottom: 80, left: 30})
               //.yLabelWidth(100)
               .brushOn(false)
               .renderTitle(true)
              /* biomass_chart.title(function (p) {
                        return [
                  p.key,
                'Moyenne: ' + numberFormat(p.value.mean) + 'k',
                'Production: ' + numberFormat(p.value.biomass) + 'k',
               // 'Fluctuation / Index Ratio: ' + numberFormat(p.value.fluctuationPercentage) + '%'
               console.log(p.key)
            ].join('\n');*/
        

               //.xAxisLabel("Année")
               //.yAxisLabel("Production de biomasse en kg")
               // .renderArea(true)
               //.renderHorizontalGridLines(true)
              // .renderVerticalGridLines(true)
               .elasticX(true)
               .elasticY(true)
               .colorAccessor(function(d,i){ return 0;})
               .renderlet(function (chart) {
                    chart.selectAll("g.x text")
                      .attr('dx', '-12')
                      .attr('transform', "rotate(-60)");
                })
               .xAxis().tickFormat(d3.format("d"));
  biomass_chart.yAxis().tickFormat(function (v) {
            return v + 'k';});


  


dc.dataCount('#count-info')
  .dimension(cf)
  .group(all);

//begin test
/**/
//end test
 anomalychoroplethmap.width($('#anomalyMap'))
             .height(500)
             .dimension(mapDimension)
             .group(mapGroup)
             .center([27.85,85.1])
             .zoom(8)
             .label(function (p) { return p.key; })
             .renderTitle(true)
             .geojson(vargeodata)
             .colors(['#fff7bc','#ffeda0','#f7fcb9','#addd8e','#31a354'])
             .colorDomain([0,3])
             .colorAccessor(function (d){
               var c = 0
                if(d<110){
                    c=  1;
                } else if (d>=110 & d<150) {
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
             .renderPopup(true);

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
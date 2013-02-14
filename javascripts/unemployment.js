var data_un; 
var data_quantile_un; 
var data_mean_un;
var data_std_un;
var data_min_un;
var data_max_un;

var county_codes_un;
var m_un = Number.MAX_VALUE;
var km_to_m_un = 1.0 / 1.609344;
var legend_min_un = {1:m_un, 2:m_un, 3:m_un, 4:m_un, 5:m_un, 6:m_un, 7:m_un, 8:m_un};
var legend_max_un = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0};

var percent_un = d3.format(".1");
var percentx_un = function(x) { return d3.format(".0f")(1*x);}
var fixed_un = d3.format(".0f");
var number_un = d3.format("n");
var fixedx_un = function(x) { return d3.format(".0f")(km_to_m_un*x);}

var format_un = percent_un;
var formatx_un = percentx_un; 


var width_un = window.innerWidth;
var height_un = window.innerHeight;

var path_un = d3.geo.path(); 

var svg_un = d3.select("#tabs-2")
  .append("svg:svg");

var label_un = svg_un.append("svg:text")
    .attr("text-anchor", "start")
    .attr("dx", 320)
    .attr("dy", 40)
    .attr("class", "label")
    ;

var map_un = svg_un.append('svg:g')
    .attr("transform", "translate(15, 30) scale(0.76)");

var counties_un = map_un.append("svg:g")
    .attr("id", "counties")
    .attr("class", "Purples") 

var states_un = map_un.append("svg:g")
    .attr("id", "states")

var legend_un = svg_un.append("svg:g")
    .attr("id", "legend")
    .attr("class", "Purples"); 

d3.json("jsondata/us-counties.json", function(json) {
  counties_un.selectAll("path")
      .data(json.features)
    .enter().append("svg:path")
      .attr("class", data_un ? quantize_un : null)
      .attr("d", path_un)
      .on("mouseover", show_un(true))
      .on("mouseout", show_un(false))
    ;

    make_legend_un();
});

d3.json("jsondata/us-states.json", function(json) {
  states_un.selectAll("path")
      .data(json.features)
    .enter().append("svg:path")
      .attr("d", path_un);
});

d3.json("jsondata/county_codes.json", function(json) {
    county_codes_un = json;
});

d3.json("jsondata/unemploy_data.json", function(json) {
    data_un = json;

    populate_stats_un(data_un);

    counties_un.selectAll("path")
        .attr("class", quantize_un)
    ;

    make_legend_un();

});

function make_legend_un()
{
    var mins = get_values_un(legend_min_un);
    if (!data_un || mins[1] == m_un)
        return;

    legend_un.selectAll("path")
            .data(mins)
        .enter().append("svg:rect")
            .attr("width", 25)
            .attr("height", 15)
            .attr("y", function(d, i){ return 30 + i*16;})
            .attr("x", 0)
            .attr("class", function(d, i){return "q" + (i+1) + "-9";})
    ;
    
    var maxes = get_values_un(legend_max_un);
    legend_un.selectAll("text")
            .data(mins)
        .enter().append("svg:text")
            .attr("text-anchor", "start") 
            .attr("x", 25)
            .attr("y", function(d, i){return 25 + i*16})
            .attr("dx", 3) 
            .attr("dy", 12 + 4) 
            .attr("class", "legend")
            .text(function (d, i){return formatx_un(d) + " - " + format_un(maxes[i]);})
    ;
}

function show_un(b)
{
    return function(d, i) {
        var s = counties_un.selectAll("path").filter(function(g){return g.id == d.id;});
        if (b)
        {
            label_un.text(county_codes_un[d.id] + ": " + format_un(data_un[d.id] !== undefined ? data_un[d.id] : 0));
            s.attr("class", "highlight");
        }
        else
        {
            label_un.text("Unemployment Distribution");
            s.attr("class", quantize_un);
        }
    }
}

function __quantize_un(f, min, max)
{
    // quantile scaling
    var q = data_quantile_un(f);
    
    // log scaling (works for countyop data)
    var l = ~~(Math.log(f+1) * (9 / (Math.log(data_max_un) - Math.log(data_min_un+1))));
    
    // original scaling (ish). 
    var o = ~~(f * 9 / (data_mean_un + data_std_un));

    // original with less head room 
    var ol = ~~(f * 11 / (data_mean_un + data_std_un));

    // original with more head room 
    var om = ~~(f * 7 / (data_mean_un + data_std_un));

    return Math.max(min, Math.min(max, q));
}

function quantize_un(d) {
    var min = 1;
    var max = 8;
    var f = data_un[d.id];
    if (f == undefined)
        f = 0;

    var q = __quantize_un(f, min, max);
    legend_min_un[q] = Math.min(legend_min_un[q], f);
    legend_max_un[q] = Math.max(legend_max_un[q], f);

    return "q" + q + "-9";
}

var get_values_un = function(obj)
{
    var values = [];
    for (var key in obj)
    {
        if (obj.hasOwnProperty(key))
            values.push(obj[key]);
    }
    return values;
}

var populate_stats_un = function(data)
{
    var values = get_values_un(data_un); 
    data_quantile_un = d3.scale.quantile();
    data_quantile_un.domain(values);
    data_quantile_un.range([1,2,3,4,5,6,7,8]);
    
    data_mean_un = d3.mean(values);
    data_std_un = std_un(values);
    data_max_un = d3.max(values);
    data_min_un = d3.min(values);
}

var std_un = function(l)
{
    var M = 0.0;
    var S = 0.0;
    var k = 1;
    for (var i = 0; i < l.length; i++)
    {
        var value = l[i];
        var tmpM = M;
        M += (value - tmpM) / k;
        S += (value - tmpM) * (value - M);
        k++;
    }
    return Math.sqrt(S / (k-1));
}
var data_rt; 
var data_quantile_rt; 
var data_mean_rt;
var data_std_rt;
var data_min_rt;
var data_max_rt;

var county_codes_rt;
var m_rt = Number.MAX_VALUE;
var km_to_m_rt = 1.0 / 1.609344;
var legend_min_rt = {1:m_rt, 2:m_rt, 3:m_rt, 4:m_rt, 5:m_rt, 6:m_rt, 7:m_rt, 8:m_rt};
var legend_max_rt = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0};

var percent_rt = d3.format(".1");
var percentx_rt = function(x) { return d3.format(".0f")(1*x);}
var fixed_rt = d3.format(".0f");
var number_rt = d3.format("n");
var fixedx_rt = function(x) { return d3.format(".0f")(km_to_m_rt*x);}

var format_rt = percent_rt;
var formatx_rt = percentx_rt; 


var width_rt = window.innerWidth;
var height_rt = window.innerHeight;

var path_rt = d3.geo.path(); 

var svg_rt = d3.select("#tabs-3")
  .append("svg:svg");

var label_rt = svg_rt.append("svg:text")
    .attr("text-anchor", "start")
    .attr("dx", 320)
    .attr("dy", 40)
    .attr("class", "label")
    ;

var map_rt = svg_rt.append('svg:g')
    .attr("transform", "translate(15, 30) scale(0.76)");

var counties_rt = map_rt.append("svg:g")
    .attr("id", "counties")
    .attr("class", "YlGn") 

var states_rt = map_rt.append("svg:g")
    .attr("id", "states")

var legend_rt = svg_rt.append("svg:g")
    .attr("id", "legend")
    .attr("class", "YlGn"); 

d3.json("jsondata/us-counties.json", function(json) {
  counties_rt.selectAll("path")
      .data(json.features)
    .enter().append("svg:path")
      .attr("class", data_rt ? quantize_rt : null)
      .attr("d", path_rt)
      .on("mouseover", show_rt(true))
      .on("mouseout", show_rt(false))
    ;

    make_legend_rt();
});

d3.json("jsondata/us-states.json", function(json) {
  states_rt.selectAll("path")
      .data(json.features)
    .enter().append("svg:path")
      .attr("d", path_rt);
});

d3.json("jsondata/county_codes.json", function(json) {
    county_codes_rt = json;
});

d3.json("jsondata/rent_data.json", function(json) {
    data_rt = json;

    populate_stats_rt(data_rt);

    counties_rt.selectAll("path")
        .attr("class", quantize_rt)
    ;

    make_legend_rt();

});

function make_legend_rt()
{
    var mins = get_values_rt(legend_min_rt);
    if (!data_rt || mins[1] == m_rt)
        return;

    legend_rt.selectAll("path")
            .data(mins)
        .enter().append("svg:rect")
            .attr("width", 25)
            .attr("height", 15)
            .attr("y", function(d, i){ return 30 + i*16;})
            .attr("x", 0)
            .attr("class", function(d, i){return "q" + (i+1) + "-9";})
    ;
    
    var maxes = get_values_rt(legend_max_rt);
    legend_rt.selectAll("text")
            .data(mins)
        .enter().append("svg:text")
            .attr("text-anchor", "start") 
            .attr("x", 25)
            .attr("y", function(d, i){return 25 + i*16})
            .attr("dx", 3) 
            .attr("dy", 12 + 4) 
            .attr("class", "legend")
            .text(function (d, i){return formatx_rt(d) + " - " + format_rt(maxes[i]);})
    ;
}

function show_rt(b)
{
    return function(d, i) {
        var s = counties_rt.selectAll("path").filter(function(g){return g.id == d.id;});
        if (b)
        {
            label_rt.text(county_codes_rt[d.id] + ": $" + format_rt(data_rt[d.id] !== undefined ? data_rt[d.id] : 0) + "/month");
            s.attr("class", "highlight");
        }
        else
        {
            label_rt.text("Medium Rent Distribution");
            s.attr("class", quantize_rt);
        }
    }
}

function __quantize_rt(f, min, max)
{
    // quantile scaling
    var q = data_quantile_rt(f);
    
    // log scaling (works for countyop data)
    var l = ~~(Math.log(f+1) * (9 / (Math.log(data_max_rt) - Math.log(data_min_rt+1))));
    
    // original scaling (ish). 
    var o = ~~(f * 9 / (data_mean_rt + data_std_rt));

    // original with less head room 
    var ol = ~~(f * 11 / (data_mean_rt + data_std_rt));

    // original with more head room 
    var om = ~~(f * 7 / (data_mean_rt + data_std_rt));

    return Math.max(min, Math.min(max, q));
}

function quantize_rt(d) {
    var min = 1;
    var max = 8;
    var f = data_rt[d.id];
    if (f == undefined)
        f = 0;

    var q = __quantize_rt(f, min, max);
    legend_min_rt[q] = Math.min(legend_min_rt[q], f);
    legend_max_rt[q] = Math.max(legend_max_rt[q], f);

    return "q" + q + "-9";
}

var get_values_rt = function(obj)
{
    var values = [];
    for (var key in obj)
    {
        if (obj.hasOwnProperty(key))
            values.push(obj[key]);
    }
    return values;
}

var populate_stats_rt = function(data)
{
    var values = get_values_rt(data_rt); 
    data_quantile_rt = d3.scale.quantile();
    data_quantile_rt.domain(values);
    data_quantile_rt.range([1,2,3,4,5,6,7,8]);
    
    data_mean_rt = d3.mean(values);
    data_std_rt = std_rt(values);
    data_max_rt = d3.max(values);
    data_min_rt = d3.min(values);
}

var std_rt = function(l)
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
var data_p; // loaded asynchronously
var data_quantile_p; // computed after load
var data_mean_p;
var data_std_p;
var data_min_p;
var data_max_p;

var county_codes_p;
var m_p = Number.MAX_VALUE;
var km_to_m_p = 1.0 / 1.609344;
// removed 0 here and hacked the legend code so that we don't have white + white borders
var legend_min_p = {1:m_p, 2:m_p, 3:m_p, 4:m_p, 5:m_p, 6:m_p, 7:m_p, 8:m_p};
var legend_max_p = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0};

var percent_p = d3.format(".1");
var percentx_p = function(x) { return d3.format(".0f")(1*x);}
var fixed_p = d3.format(".0f");
var number_p = d3.format("n");
var fixedx_p = function(x) { return d3.format(".0f")(km_to_m_p*x);}

// NB: Change your number format function here:
var format_p = percent_p;
var formatx_p = percentx_p; 


var width_p = window.innerWidth;
var height_p = window.innerHeight;

var path_p = d3.geo.path(); // Can do scaling here

var svg_p = d3.select("#tabs-1")
  .append("svg:svg");

var label_p = svg_p.append("svg:text")
    .attr("text-anchor", "start")
    .attr("dx", 350)
    .attr("dy", 40)
    .attr("class", "label")
    ;

var map_p = svg_p.append('svg:g')
    .attr("transform", "translate(15, 30) scale(0.76)");

var counties_p = map_p.append("svg:g")
    .attr("id", "counties")
    .attr("class", "Reds") // NB: Change color scheme here

var states_p = map_p.append("svg:g")
    .attr("id", "states")

var legend_p = svg_p.append("svg:g")
    .attr("id", "legend")
    .attr("class", "Reds"); // NB: Change the color scheme here

d3.json("jsondata/us-counties.json", function(json) {
  counties_p.selectAll("path")
      .data(json.features)
    .enter().append("svg:path")
      .attr("class", data_p ? quantize_p : null)
      .attr("d", path_p)
      .on("mouseover", show_p(true))
      .on("mouseout", show_p(false))
    ;

    make_legend_p();
});

d3.json("jsondata/us-states.json", function(json) {
  states_p.selectAll("path")
      .data(json.features)
    .enter().append("svg:path")
      .attr("d", path_p);
});

d3.json("jsondata/county_codes.json", function(json) {
    county_codes_p = json;
});

d3.json("jsondata/pop_data.json", function(json) {
    data_p = json;

    populate_stats_p(data_p);

    counties_p.selectAll("path")
        .attr("class", quantize_p)
    ;

    make_legend_p();

});

function make_legend_p()
{
    var mins = get_values_p(legend_min_p);
    if (!data_p || mins[1] == m_p)
        return;

    legend_p.selectAll("path")
            .data(mins)
        .enter().append("svg:rect")
            .attr("width", 25)
            .attr("height", 15)
            .attr("y", function(d, i){ return 30 + i*16;})
            .attr("x", 0)
            .attr("class", function(d, i){return "q" + (i+1) + "-9";})
    ;
    
    var maxes = get_values_p(legend_max_p);
    legend_p.selectAll("text")
            .data(mins)
        .enter().append("svg:text")
            .attr("text-anchor", "start") // text-align
            .attr("x", 25)
            .attr("y", function(d, i){return 25 + i*16})
            .attr("dx", 3) // padding-right
            .attr("dy", 12 + 4) // vertical-align: used font size (copied from css. must be a better way)
            .attr("class", "legend")
            .text(function (d, i){return formatx_p(d) + " - " + format_p(maxes[i]);})
    ;
}

function show_p(b)
{
    return function(d, i) {
        var s = counties_p.selectAll("path").filter(function(g){return g.id == d.id;});
        if (b)
        {
            label_p.text(county_codes_p[d.id] + ": " + format_p(data_p[d.id] !== undefined ? data_p[d.id] : 0));
            s.attr("class", "highlight");//"q0-9"
        }
        else
        {
            label_p.text("Population Distribution");
            s.attr("class", quantize_p);
        }
    }
}

function __quantize_p(f, min, max)
{
    // quantile scaling
    var q = data_quantile_p(f);
    
    // log scaling (works for countyop data)
    var l = ~~(Math.log(f+1) * (9 / (Math.log(data_max_p) - Math.log(data_min_p+1))));
    
    // original scaling (ish). 
    var o = ~~(f * 9 / (data_mean_p + data_std_p));

    // original with less head room 
    var ol = ~~(f * 11 / (data_mean_p + data_std_p));

    // original with more head room 
    var om = ~~(f * 7 / (data_mean_p + data_std_p));

    // NB: Choose your scaling function here.
    return Math.max(min, Math.min(max, q));
}

function quantize_p(d) {
    // map data[d.id] to be between 0 and 8
    // original code did:
    // values ranged between 1.2 and 30.1. Avg was 9, std is 3.65
    var min = 1;
    var max = 8;
    var f = data_p[d.id];
    if (f == undefined)
        f = 0;

    var q = __quantize_p(f, min, max);
    legend_min_p[q] = Math.min(legend_min_p[q], f);
    legend_max_p[q] = Math.max(legend_max_p[q], f);

    return "q" + q + "-9";
}

var get_values_p = function(obj)
{
    var values = [];
    for (var key in obj)
    {
        if (obj.hasOwnProperty(key))
            values.push(obj[key]);
    }
    return values;
}

var populate_stats_p = function(data)
{
    // need sorted values for quantile
    var values = get_values_p(data_p); 
    data_quantile_p = d3.scale.quantile();
    data_quantile_p.domain(values);
    data_quantile_p.range([1,2,3,4,5,6,7,8]);
    
    data_mean_p = d3.mean(values);
    data_std_p = std_p(values);
    data_max_p = d3.max(values);
    data_min_p = d3.min(values);
}

var std_p = function(l)
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
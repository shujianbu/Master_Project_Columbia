    var continent = 0, 
        re_stack = "";

    /* Flatten the tree into an array to faciliate transformation. */
    var refugees = pv.flatten(refugees)
        .key("refugee")
        .key("continent", function(g) (g == "aff") ? 1 : 2) 
        .key("year", function(i) years[i])
        .key("people")
        .array(); 

    /*
     * Use per-year sums to normalize the data, so we can compute a
     * percentage. Use per-continent+refugee sums to determine a saturation encoding.
     */
    var sumByYear = pv.nest(refugees)
        .key(function(d) d.year)
        .rollup(function(v) pv.sum(v, function(d) d.people)),
      sumByrefugee = pv.nest(refugees)
        .key(function(d) d.continent + d.refugee)
        .rollup(function(v) pv.sum(v, function(d) d.people));

    /* Cache the percentage of people employed per year. */
    refugees.forEach(function(d) d.percent = 100 * d.people / sumByYear[d.year]);

    /* Sizing parameters and scales. */
    var w_stack = 700,
        h_stack = 360,
        x_stack = pv.Scale.linear(1996, 2011).range(0, w_stack), 
        y_stack = pv.Scale.linear(0, 100).range(0, h_stack), 
        color_stack = pv.Scale.ordinal(1, 2).range("#33f", "#f33"),
        alpha_stack = pv.Scale.linear(pv.values(sumByrefugee)).range(.4, .8);

    /* The root panel. */
    var vis_stack = new pv.Panel()
        .width(w_stack)
        .height(h_stack)
        .top(5)
        .left(36.5)
        .right(20)
        .bottom(20); 

    /* A background bar to reset the search query.  */
    vis_stack.add(pv.Bar)
        .fillStyle("white")
        .event("click", function() search_stack(""))
        .cursor("pointer");

    /* Y-axis ticks and labels. */
    vis_stack.add(pv.Rule)
        .data(function() y_stack.ticks())
        .bottom(y_stack)
        .strokeStyle(function(y_stack) y_stack ? "#ccc" : "#000")
      .anchor("left").add(pv.Label)
        .text(function(d) y_stack.tickFormat(d) + "%");

    /* Stack layout. */
    var area_stack = vis_stack.add(pv.Layout.Stack)
        .layers(function() pv.nest(refugees.filter(test_stack))
            .key(function(d) d.continent + d.refugee)
            .sortKeys(function(a, b) pv.reverseOrder(a.substring(1), b.substring(1)))
            .entries())
        .values(function(d) d.values)
        .x(function(d) x_stack(d.year))
        .y(function(d) y_stack(d.percent))
      .layer.add(pv.Area)
        .def("alphai", function(d) alpha_stack(sumByrefugee[d.key]))
        .fillStyle(function(d) color_stack(d.continent).alphai(this.alphai()))
        .cursor("pointer")
        .event("mouseover", function(d) this.alphai(1).title(d.refugee))
        .event("mouseout", function(d) this.alphai(null)) 
        .event("click", function(d) search_stack("^" + d.refugee + "$"));

    /* Stack labels. */
    vis_stack.add(pv.Panel)
        .extend(area_stack.parent)
      .add(pv.Area)
        .extend(area_stack)
        .fillStyle(null)
      .anchor("center").add(pv.Label)
        .def("max", function(d) pv.max.index(d.values, function(d) d.percent))
        .visible(function() this.index == this.max())
        .font(function(d) Math.round(5 + Math.sqrt(y_stack(d.percent))) + "px sans-serif")
        .textMargin(6)
        .textStyle(function(d) "rgba(0, 0, 0, " + (Math.sqrt(y_stack(d.percent)) / 7) + ")")
        .textAlign(function() this.index < 5 ? "left" : "right")
        .text(function(d, p) p.key.substring(1));

    /* X-axis ticks and labels. */
    vis_stack.add(pv.Rule)
        .data(pv.range(1996, 2012, 1))
        .left(x_stack)
        .bottom(-6)
        .height(5)
      .anchor("bottom").add(pv.Label);

    /* Update the query regular expression when text is entered. */
    function search_stack(text) {
      if (text != re_stack) {
        if (query.value != text) {
          query.value = text;
          query.focus();
        }
        re_stack = new RegExp(text, "i");
        update_stack();
      }
    }

    /* Tests to see whether the specified datum matches the current filters. */
    function test_stack(d) {
      return (!continent || d.continent == continent) && d.refugee.match(re_stack);
    }

    /* Recompute the y-scale domain based on query filtering. */
    function update_stack() {
      y_stack.domain(0, Math.min(100, pv.max(pv.values(pv.nest(refugees.filter(test_stack))
          .key(function(d) d.year)
          .rollup(function(v) pv.sum(v, function(d) d.percent))))));
      vis_stack.render();
    }

    vis_stack.render();

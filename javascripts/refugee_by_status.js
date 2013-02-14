    var continent = 1, 
        re_stack = "";

    var refugees = pv.flatten(refugees)
        .key("refugee")
        .key("continent", function(g) {return (g == "aff" ? 1 : 2) }) 
        .key("year", function(i) {return years[i]})
        .key("people")
        .array(); 

    var sumByYear = pv.nest(refugees)
        .key(function(d) { return d.year} )
        .rollup(function(v) { return pv.sum(v, function(d) {return d.people })}),
      sumByrefugee = pv.nest(refugees)
        .key(function(d) { return d.continent + d.refugee})
        .rollup(function(v) { return pv.sum(v, function(d) {return d.people })});

    refugees.forEach(function(d) { return d.percent = 100 * d.people / sumByYear[d.year] });

    var w_stack = 700,
        h_stack = 360,
        x_stack = pv.Scale.linear(1996, 2011).range(0, w_stack), 
        y_stack = pv.Scale.linear(0, 100).range(0, h_stack), 
        color_stack = pv.Scale.ordinal(1, 2).range("#33ffff", "#ffff33"),
        alpha_stack = pv.Scale.linear(pv.values(sumByrefugee)).range(.4, .8);

    var vis_stack = new pv.Panel()
        .width(w_stack)
        .height(h_stack)
        .top(5)
        .left(36.5)
        .right(20)
        .bottom(20); 

    vis_stack.add(pv.Bar)
        .fillStyle_s("#eef6fa")
        .event("click", function() { return search_stack("")})
        .cursor("pointer");

    vis_stack.add(pv.Rule)
        .data(function() { return y_stack.ticks()})
        .bottom(y_stack)
        .strokeStyle_s(function(y_stack) { return (y_stack ? "#ccc" : "#000") }) 
      .anchor("left").add(pv.Label)
        .text(function(d) { return y_stack.tickFormat(d) + "%" });

    var area_stack = vis_stack.add(pv.Layout.Stack)
        .layers(function() { return pv.nest(refugees.filter(test_stack))
            .key(function(d) { return d.continent + d.refugee })
            .sortKeys(function(a, b) { return pv.reverseOrder(a.substring(1), b.substring(1)) })
            .entries() })
        .values(function(d) { return d.values })
        .x(function(d) { return x_stack(d.year) })
        .y(function(d) { return y_stack(d.percent)})
      .layer.add(pv.Area)
        .def("alphai", function(d) { return alpha_stack(sumByrefugee[d.key])} )
        .fillStyle_s(function(d) { return color_stack(d.continent).alphai(this.alphai()) })
        .cursor("pointer")
        .event("mouseover", function(d) { return this.alphai(1).title(d.refugee) })
        .event("mouseout", function(d) { return this.alphai(null) }) 
        .event("click", function(d) { return search_stack("^" + d.refugee + "$")});

    vis_stack.add(pv.Panel)
        .extend(area_stack.parent)
      .add(pv.Area)
        .extend(area_stack)
        .fillStyle_s(null)
      .anchor("center").add(pv.Label)
        .def("max", function(d) { return pv.max.index(d.values, function(d) { return d.percent })} )
        .visible(function() { return this.index == this.max()})
        .font(function(d) { return Math.round(5 + Math.sqrt(y_stack(d.percent))) + "px sans-serif" })
        .textMargin(6)
        .textStyle(function(d) { return "rgba(100, 100, 100, " + (Math.sqrt(y_stack(d.percent)) / 3) + ")" })
        .textAlign(function() { return this.index < 5 ? "left" : "right"})
        .text(function(d, p) { return p.key.substring(1)});

    vis_stack.add(pv.Rule)
        .data(pv.range(1996, 2012, 1))
        .left(x_stack)
        .bottom(-6)
        .height(5)
      .anchor("bottom").add(pv.Label);

    function search_stack(text) {
      if (text != re_stack) {
        if (query.value != text) {
          query.value = text;
          query.focus();
        }
        re_stack = new RegExp(text, "i");
        update();
      }
    }

    function test_stack(d) {
      return (!continent || d.continent == continent) && d.refugee.match(re_stack);
    }

    function update() {
      y_stack.domain(0, Math.min(100, pv.max(pv.values(pv.nest(refugees.filter(test_stack))
          .key(function(d) { return d.year })
          .rollup(function(v) { return pv.sum(v, function(d) { return d.percent }) })) )));
      vis_stack.render();
    }

    vis_stack.render();
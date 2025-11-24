// Scatterplot with brushing + legend + linked list
function scatter_plot(data, ax, title, xCol, yCol, rCol, colorCol, margin = 100) {
    const width = 600;
    const height = 450;
  
    const svg = d3.select(ax)
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("class", "title")
      .text(title);
  
    const innerWidth = width - margin;
    const innerHeight = height - margin;
  
    const chart = svg.append("g")
      .attr("transform", `translate(${margin / 2}, ${margin / 2})`);
  
    // Scales
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => +d[xCol])).nice()
      .range([0, innerWidth]);
  
    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => +d[yCol])).nice()
      .range([innerHeight, 0]);
  
    const r = d3.scaleSqrt()
      .domain(d3.extent(data, d => +d[rCol]))
      .range([4, 12]);
  
    const color = d3.scaleOrdinal(d3.schemeTableau10);
  
    // Points
    const circles = chart.selectAll("circle")
      .data(data, d => d.index)
      .enter()
      .append("circle")
      .attr("cx", d => x(d[xCol]))
      .attr("cy", d => y(d[yCol]))
      .attr("r", d => r(d[rCol]))
      .attr("fill", d => color(d[colorCol]))
      .attr("opacity", 0.7)
      .attr("stroke", "none");
  
    // Axes
    chart.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x));
  
    chart.append("g")
      .call(d3.axisLeft(y));
  
    // ----- Brushing -----
    const brush = d3.brush()
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on("brush end", brushed);
  
    chart.append("g")
      .attr("class", "brush")
      .call(brush);
  
    function brushed(event) {
      const sel = event.selection;
      if (!sel) {
        circles.classed("selected", false);
        updateList();
        return;
      }
  
      const [[x0, y0], [x1, y1]] = sel;
  
      circles.classed("selected", d => {
        const cx = x(d[xCol]);
        const cy = y(d[yCol]);
        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
      });
  
      updateList();
    }
  
    // Clicking on empty SVG clears selection (Missing Part 4 behavior)
    svg.on("click", (event) => {
      if (event.target.tagName === "svg") {
        d3.selectAll("circle").classed("selected", false);
        d3.select("#selected-list").selectAll("li").remove();
        chart.select(".brush").call(brush.move, null);
      }
    });
  
    // ----- Legend -----
    const categories = [...new Set(data.map(d => d[colorCol]))];
  
    const legends = svg.append("g")
      .attr("transform", "translate(20, 80)");
  
    const items = legends.selectAll(".legend-item")
      .data(categories)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 30})`);
  
    items.append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", d => color(d))
      .attr("stroke", "black");
  
    items.append("text")
      .text(d => d)
      .attr("x", 30)
      .attr("y", 15)
      .attr("font-size", "14px");
  
    // Legend hover highlight (Missing Part 5 behavior)
    items
      .on("mouseover", (event, cat) => {
        circles.style("opacity", d => d[colorCol] === cat ? 1 : 0.1);
      })
      .on("mouseout", () => {
        circles.style("opacity", 0.7);
      });
  
    // ----- Update selected list (shared across both plots) -----
    function updateList() {
      const selectedData = d3.selectAll("circle.selected").data();
      const list = d3.select("#selected-list");
  
      list.selectAll("li").remove();
  
      if (selectedData.length === 0) return;
  
      list.selectAll("li")
        .data(selectedData)
        .enter()
        .append("li")
        .text(d =>
          `${d.Model} | Country: ${d.Country} | Price: $${d.Price} | MPG: ${d.MPG} | Engine Size: ${d.EngineSizeCI} | Weight: ${d.Weight}`
        );
    }
  }
  

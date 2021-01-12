// Preliminary Variable Setup
let svgWidth = 960;
let svgHeight = 500;

let margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Creates an SVG, appends an SVG group that will hold the interactive chart,
// and shifts the latter by left and top margins.

let svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Appends an SVG group
let chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Parameters
let selectedXAxis = "poverty";
let selectedYAxis = "healthcare";

// The xScale function updates x-scale variables upon clicking the axis label
function xScale(journalismData, selectedXAxis) {
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(journalismData, d => d[selectedXAxis]) * 0.8,
            d3.max(journalismData, d => d[selectedXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;
}

// The renderXAxis function in turn updates the xAxis variables upon clicking the axis label
function renderXAxis(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXscale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// The yScale function updates y-scale variables upon clicking the axis label
function yScale(journalismData, selectedYAxis) {
    let yLinearScale = d3.scaleLinear()
        .domain([d3.min(journalismData, d => d[selectedYAxis]) * 0.8,
            d3.max(journalismData, d => d[selectedYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;
}

// The renderYAxis function in turn updates the yAxis variables upon clicking the axis label
function renderYAxis(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYscale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// Updates Circles Group with a transition to new circles
function renderCircles(circlesGroup, newXScale, selectedXAxis, newYScale, selectedYAxis) {
    
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[selectedXAxis]))
        .attr("cy", d => newYScale(d[selectedYAxis]));

    return circlesGroup;
}

// Updates Circles Group with new tooltips
function updateToolTip(selectedXAxis, selectedYAxis, circlesGroup) {

    var xLabel;

    if (selectedXAxis === "poverty") {
        xLabel = "In Poverty (%):";
    }
    else if (selectedXAxis === "age") {
        xLabel = "Age (Median):";
    }
    else {
        xLabel = "Household Income (Median):";
    }

    var yLabel;

    if (selectedYAxis === "healthcare") {
        yLabel = "Lacks Healthcare (%)";
    }
    else if (selectedYAxis === "smokes") {
        yLabel = "Smokes (%):";
    }
    else {
        yLabel = "Obese (%):";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${xLabel} ${d[selectedXAxis]}<br>${yLabel} ${d[selectedYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        // On Mouseout Event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

// Retrieves data from CSV file and executes all below
d3.csv("census_Journalism_Data.csv").then(function(journalismData, err) {
    if (err) throw err;

    // Parses data
    journalismData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    });

    let xLinearScale = xScale(journalismData, selectedXAxis);
    let yLinearScale = yScale(journalismData, selectedYAxis);

    // Creates Initial Axis Functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // Appends X Axis
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Appends Y Axis
    chartGroup.append("g")
        .call(leftAxis);

    let circlesGroup = chartGroup.selectAll("circle")
        .data(journalismData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[selectedXAxis]))
        .attr("cy", d => yLinearScale(d[selectedYAxis]))
        .attr("r", 20)
        .attr("fill", "pink")
        .attr("opacity", ".5");
})
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

    // Appends Initial Circles
    let circlesGroup = chartGroup.selectAll("circle")
        .data(journalismData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[selectedXAxis]))
        .attr("cy", d => yLinearScale(d[selectedYAxis]))
        .attr("r", 20)
        .attr("fill", "pink")
        .attr("opacity", ".5");
    
    // Creates groups for two x-axis labels
    let labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    let povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // Value being grabbed for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    let ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // Value being grabbed for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    let incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // Value being grabbed for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");
    
    let healthcareLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "lem")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    let smokesLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", -20 - (height / 2))
        .attr("dy", "lem")
        .classed("inactive", false)
        .text("Smokes (%)");

    let obesityLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", -40 - (height / 2))
        .attr("dy", "lem")
        .classed("inactive", false)
        .text("Obese (%)");

    var circlesGroup = updateToolTip(selectedXAxis, circlesGroup);

    labelsGroup.selectAll("text")
        .on("click", function() {
            // Gets value of selection
            let value = d3.select(this).attr("value");
            if (value !== selectedXAxis) {

                // Replaces selectedXAxis with Value
                selectedXAxis = value;

                // Updates X Scale with new data
                xLinearScale = xScale(journalismData, selectedXAxis);

                // Updates X Axis with transition
                xAxis = renderXAxis(xLinearScale, xAxis);

                // Updates Y Scale with new data
                yLinearScale = yScale(journalismData, selectedYAxis);

                // Updates Y Axis with transition
                yAxis = renderYAxis(yLinearScale, yAxis);

                // Updates Circles with new x and y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, selectedXAxis, yLinearScale, selectedYaxis);

                // Updates Tooltips with new information
                circlesGroup = updateToolTip(selectedXAxis, circlesGroup);

                if (selectedXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (selectedXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
}).catch(function(error) {
    console.log(error);
});
function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  d3.json('/metadata/' + sample).then(d => {
    // Use d3 to select the panel with id of `#sample-metadata`
    var metadataPanel = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    metadataPanel.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(d).forEach(([k,v])=>{
      metadataPanel.append("p").html(`<strong>${k} : </strong>${v}`)
    })
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.

    // BONUS: Build the Gauge Chart
    buildGauge(d.WFREQ);
   })
}

function buildGauge(wash){
  //based on: https://plot.ly/javascript/gauge-charts/
  var degrees = 180 - (wash *20),
  radius = .5;
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
  pathX = String(x),
  space = ' ',
  pathY = String(y),
  pathEnd = ' Z';
  var path = mainPath.concat(pathX,space,pathY,pathEnd);
  var needleTrace = {
    type: 'scatter',
    x: [0], 
    y:[0],
    marker: {size: 28, color:'850000'},
    showlegend: false,
    name: 'Wash Frequency',
    text: wash,
    hoverinfo: 'text+name'}
  var gaugeTrace = {
    values: [1, 1, 1, 1, 1, 1, 1, 1, 1, 9],
    rotation: 90,
    text: ['8-9','7-8','6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1',''],
    textinfo: 'text',
    textposition:'inside',
    marker: {colors:['rgba(46,151,208, .5)', 'rgba(63,159,190, .5)', 'rgba(80,168,173, .5)', 'rgba(98,176,155, .5)', 'rgba(115,185,138, .5)', 'rgba(132,194,121, .5)', 'rgba(150,202,103, .5)', 'rgba(167,211,86, .5)', 'rgba(185,220,69, .5)', 'rgba(255, 255, 255, 0)']},
    labels: ['8-9','7-8','6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1',''],
    hoverinfo: 'label',
    hole: .5,
    type: 'pie',
    showlegend: false}

  var gaugeLayout = {
    shapes:[{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
        color: '850000'
      }
      }],
      height: 500,
      width: 600,
      xaxis: {type:'category',zeroline:false, showticklabels:false,
      showgrid: false, range: [-1, 1]},
      yaxis: {type:'category',zeroline:false, showticklabels:false,
      showgrid: false, range: [-1, 1]}
  }
    Plotly.newPlot('gauge', [needleTrace, gaugeTrace], gaugeLayout)
}

function buildCharts(sample) {
  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json('/samples/' + sample).then(d => {
    // @TODO: Build a Bubble Chart using the sample data
    // var colors = d3.scaleLinear()
    //   .domain([
    //     0,
    //     d3.max(d.otu_ids.map(o=>o),
    //     )
    //   .range(['#66CCFF', '#AAFF00','#339966'])
    var bubbleTrace = {
      x : d.otu_ids.map(o=>o),
      y : d.sample_values.map(s=>s),
      mode : 'markers',
      text : d.otu_labels.map(l=>l),
      marker : {
        size : d.sample_values.map(s=>s),
        color : d.otu_ids.map(o=>o),
        colorscale : 'Portland'
        },
      type : 'scatter'
    }

    Plotly.newPlot('bubble', [bubbleTrace]);
    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    // DGR: If I sort the values seperately from the labels, won't I lose their connection?
    // DGR: It seems easier to keep data-label fidelity with an array of objects than with an object of arrays.
    var sampleArray = []
    d.otu_ids.forEach((dat, ind) =>{ //Creates an array of objects
      sampleArray.push({
        otu_id : dat,
        sample_value : d.sample_values[ind],
        otu_label : d.otu_labels[ind]
        })
    })
    var top10 = sampleArray.sort((a,b) => {a.otu_id - b.otu_id})  //sorts the array of objects and cuts the top 10
      .slice(0,10)
    var pieTrace = {
        values : top10.map(t=>t.sample_value),
        labels : top10.map(t=>t.otu_id),
        text : top10.map(t=>t.otu_label),
        type : 'pie',
        showarrow: false
    }
    var pieLayout = {
      showarrow: false
    }
    Plotly.newPlot('pie',[pieTrace], pieLayout)
});
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();

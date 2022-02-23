console.log("step 2 JS read")

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

// Create the base layer
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 3,
    layers: [topo, street]
});

topo.addTo(myMap);

var baseMap = {
    Topography: topo,
    "Street Map": street
};

// Overlay variables
var earthquakesLayer = new L.LayerGroup();
var tecPlateLayer = new L.LayerGroup();

// Overlays
var overlayMaps = {
    Earthquakes: earthquakesLayer,
    "Tectonic Plates": tecPlateLayer
  };

L.control
.layers(baseMap, overlayMaps)
.addTo(myMap);
  
var earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'

d3.json(earthquakeUrl).then(function (data) {
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    L.geoJSON(data, {
        pointToLayer: function circleLayer(features, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(features.properties.mag),
                fillColor: markerColor(features.geometry.coordinates[2]),
                stroke: true,   
                color: "white",
                weight: 0.7,
                opacity: 0.8,
                fillOpacity: 0.7
            });
        },
        onEachFeature: onEachFeature
    }).addTo(earthquakesLayer);

    earthquakesLayer.addTo(myMap);

    // Define a markerSize based on earthquake magnitude
    function markerSize(magnitude) {
      return magnitude * 5;
    };

    // Define markerColor based on earthquake depth
    function markerColor(depth) {
      switch (true) {
        case depth > 90:
          return "#ea2c2c";
        case depth > 70:
          return "#ea822c";
        case depth > 50:
          return "#ee9c00";
        case depth > 30:
          return "#eecc00";
        case depth > 10:
          return "#d4ee00";
        default:
          return "#98ee00";
      }
    };

    // Popup window
    function onEachFeature(feature, layer) {
        
      layer.bindPopup(
        "Magnitude: "
        + feature.properties.mag
        + "<br>Depth: "
        + feature.geometry.coordinates[2]
        + "<br>Location: "
        + feature.properties.place
      );
    };

    // tectonic plates url
    var tecPlateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

    d3.json(tecPlateUrl).then(function(tectonicData) {
        L.geoJSON(tectonicData, {
            color: "orange",
            weight: 2,
        }).addTo(tecPlateLayer);

        tecPlateLayer.addTo(myMap);
    })

    // Legend on the map
    var legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        var legend_div = L.DomUtil.create("div", "info legend");
        var depths = [-10, 10, 30, 50, 70, 90];
        var labels = [];
        var legendData = "<h4> Earthquake <br> Depth </h4>";

        legend_div.innerHTML = legendData;

        for (var i = 0; i < depths.length; i++) {
            labels.push('<li style="background-color:' + markerColor(depths[i] + 1) + '"> <span>' + depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '' : '+') + '</span></li>');
        }

        // add each label list item to the div under the <ul> tag
        legend_div.innerHTML += "<ul>" + labels.join("") + "</ul>";

        return legend_div;
    };
    legend.addTo(myMap);
});

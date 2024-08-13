//---------------------------------------------------------------------------------------------------------
// Establish base map layer
//---------------------------------------------------------------------------------------------------------

    // Create the tile layers for the streetmap and topographical map backgrounds of our map.
let mapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create a baseMaps object to hold the map layers.
let baseMaps = {
    "Street Map": mapLayer
    };

//---------------------------------------------------------------------------------------------------------
// Chicago boundaries layer
//---------------------------------------------------------------------------------------------------------
    // Chicago Data Portal for Chicago Neighborhood Boundaries:
let urlChicago = "https://data.cityofchicago.org/resource/y6yq-dbs2.json";

    // Function to transpose original coordinates from [lng, lat] to [lat, lng]
function transposeCoordinates(coords) {
    return coords.map(coord => [coord[1], coord[0]]);
    };

    // Set empty layerGroup for community area boundaries
let mapOutput = L.layerGroup();

    // Fetch Chicago data
d3.json(urlChicago).then(function(data) {

    // Step to ensure data has been retrieved
    if (data && data.length > 0) {

        // Set empty list to store all polygonal coordinates for mapping Chicago community areas
        let oneOf77 = [];
        
        // Loop through all community area data
        for (let i = 0; i < data.length; i++) {
            let area = data[i];
            let coordinates = area.the_geom.coordinates[0][0];
            let transposedCoords = transposeCoordinates(coordinates);
            let pri_neigh = area.pri_neigh;

            // Function to set primary neighborhood (pri_neigh) as defined by boundaries dataset to 
            //     match community areas in financial dataset to facilitate pairing of data
            function setCommunityArea(pri_neigh) {
                return pri_neigh == "Andersonville"         ? "Edgewater":
                       pri_neigh == "Boystown"              ? "Lake View":
                       pri_neigh == "Bucktown"              ? "Logan Square":
                       pri_neigh == "Chinatown"             ? "Armour Square":
                       pri_neigh == "East Village"          ? "West Town":
                       pri_neigh == "Galewood"              ? "Austin":
                       pri_neigh == "Gold Coast"            ? "Near North Side":
                       pri_neigh == "Grand Crossing"        ? "Greater Grand Crossing": //to accommodate typographical/name variation
                       pri_neigh == "Grant Park"            ? "Loop":
                       pri_neigh == "Greektown"             ? "Near West Side":
                       pri_neigh == "Humboldt Park"         ? "Humboldt park": //to accommodate typographical/name variation
                       pri_neigh == "Jackson Park"          ? "Woodlawn":
                       pri_neigh == "Little Italy, UIC"     ? "Near West Side":
                       pri_neigh == "Little Village"        ? "South Lawndale":
                       pri_neigh == "Magnificent Mile"      ? "Near North Side":
                       pri_neigh == "Mckinley Park"         ? "McKinley Park": //to accommodate typographical/name variation
                       pri_neigh == "Millenium Park"        ? "Loop":
                       pri_neigh == "Montclare"             ? "Montclaire": //to accommodate typographical/name variation
                       pri_neigh == "Museum Campus"         ? "Near South Side":
                       pri_neigh == "Old Town"              ? "Near North Side":
                       pri_neigh == "Printers Row"          ? "Loop":
                       pri_neigh == "River North"           ? "Near North Side":
                       pri_neigh == "Rush & Division"       ? "Near North Side":
                       pri_neigh == "Sauganash,Forest Glen" ? "Forest Glen": //to accommodate typographical/name variation
                       pri_neigh == "Sheffield & DePaul"    ? "Lincoln Park":
                       pri_neigh == "Streeterville"         ? "Near North Side":
                       pri_neigh == "Ukrainian Village"     ? "West Town":
                       pri_neigh == "United Center"         ? "Near West Side":
                       pri_neigh == "West Loop"             ? "Near West Side":
                       pri_neigh == "Wicker Park"           ? "West Town":
                       pri_neigh == "Wrigleyville"          ? "Lake View":
                       pri_neigh;
            }

            let polygon = L.polygon(
                transposedCoords,
                {color: "blue",
                 weight: 0.5,
                 fillOpacity: 0.20
                }
            ).bindPopup("Neighborhood: <h3>" + setCommunityArea(pri_neigh) + "</h3>");

            oneOf77.push(polygon);
        }

        mapOutput.addLayer(L.layerGroup(oneOf77));
    } else {
        console.error("Data is not in the expected format or is empty.");
    }
}).catch(function(error) {
    console.error("Failed to load Chicago data:", error);
});

//---------------------------------------------------------------------------------------------------------
// Establish overlayMaps object/layers
//---------------------------------------------------------------------------------------------------------
    // Create an overlayMaps object to hold the neighborhoods layer.
let overlayMaps = {
    "Neighborhoods": mapOutput
};

    // Initialize the map
let myMap = L.map("map", {
    center: [41.831832, -87.623177], // Coordinates for Chicago
    zoom: 11.0,
    layers: [mapLayer] // Start with only the base layer
});

    // Add control layers to the map
L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(myMap);

    // Add mapOutput layer group to the map after data is loaded
mapOutput.addTo(myMap);

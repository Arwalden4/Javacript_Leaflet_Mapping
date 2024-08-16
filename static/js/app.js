//---------------------------------------------------------------------------------------------------------
// Establish base map layer
//---------------------------------------------------------------------------------------------------------
let mapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let baseMaps = {
    "Street Map": mapLayer
};

//---------------------------------------------------------------------------------------------------------
// Chicago boundaries layer
//---------------------------------------------------------------------------------------------------------
let urlChicago = "https://data.cityofchicago.org/resource/y6yq-dbs2.json";
let urlIncomeData = "static/resources/Census_Data_-_Selected_socioeconomic_indicators_in_Chicago__2008___2012_20240812.json";

function transposeCoordinates(coords) {
    return coords.map(coord => [coord[1], coord[0]]);
}

let mapOutput = L.layerGroup();
let incomeData = {}; 

// Fetch Chicago boundaries data
d3.json(urlChicago).then(function(data) {
    if (data && data.length > 0) {
        // Fetch income data
        d3.json(urlIncomeData).then(function(income) {
            if (income && income.length > 0) {
                // Create a dictionary for quick lookup by neighborhood name
                income.forEach(item => {
                    let neighborhood = item['COMMUNITY AREA NAME']; // Ensure this matches your JSON structure
                    let incomeValue = item['PER CAPITA INCOME']; // Ensure this matches your JSON structure
                    incomeData[neighborhood] = incomeValue;
                });
                
                // Function to determine color based on income
                function getColorForIncome(income) {
                    return income > 70000 ? 'green' :
                           income > 50000 ? 'yellow' :
                           income > 30000 ? 'orange' :
                                             'red';
                }
                
                // Function to set primary neighborhood (pri_neigh) as defined by boundaries dataset
                function setCommunityArea(pri_neigh) {
                    return pri_neigh == "Andersonville"         ? "Edgewater":
                           pri_neigh == "Boystown"              ? "Lake View":
                           pri_neigh == "Bucktown"              ? "Logan Square":
                           pri_neigh == "Chinatown"             ? "Armour Square":
                           pri_neigh == "East Village"          ? "West Town":
                           pri_neigh == "Galewood"              ? "Austin":
                           pri_neigh == "Gold Coast"            ? "Near North Side":
                           pri_neigh == "Grand Crossing"        ? "Greater Grand Crossing":
                           pri_neigh == "Grant Park"            ? "Loop":
                           pri_neigh == "Greektown"             ? "Near West Side":
                           pri_neigh == "Humboldt Park"         ? "Humboldt park":
                           pri_neigh == "Jackson Park"          ? "Woodlawn":
                           pri_neigh == "Little Italy, UIC"     ? "Near West Side":
                           pri_neigh == "Little Village"        ? "South Lawndale":
                           pri_neigh == "Magnificent Mile"      ? "Near North Side":
                           pri_neigh == "Mckinley Park"         ? "McKinley Park":
                           pri_neigh == "Millenium Park"        ? "Loop":
                           pri_neigh == "Montclare"             ? "Montclaire":
                           pri_neigh == "Museum Campus"         ? "Near South Side":
                           pri_neigh == "Old Town"              ? "Near North Side":
                           pri_neigh == "Printers Row"          ? "Loop":
                           pri_neigh == "River North"           ? "Near North Side":
                           pri_neigh == "Rush & Division"       ? "Near North Side":
                           pri_neigh == "Sauganash,Forest Glen" ? "Forest Glen":
                           pri_neigh == "Sheffield & DePaul"    ? "Lincoln Park":
                           pri_neigh == "Streeterville"         ? "Near North Side":
                           pri_neigh == "Ukrainian Village"     ? "West Town":
                           pri_neigh == "United Center"         ? "Near West Side":
                           pri_neigh == "West Loop"             ? "Near West Side":
                           pri_neigh == "Wicker Park"           ? "West Town":
                           pri_neigh == "Wrigleyville"          ? "Lake View":
                           pri_neigh;
                }

                // Loop through all community area data
                let oneOf77 = [];
                for (let i = 0; i < data.length; i++) {
                    let area = data[i];
                    let coordinates = area.the_geom.coordinates[0][0];
                    let transposedCoords = transposeCoordinates(coordinates);
                    let pri_neigh = area.pri_neigh;
                    let neighborhoodName = setCommunityArea(pri_neigh);
                    let income = incomeData[neighborhoodName] || 0; // Default to 0 if income is not found
                    
                    let polygon = L.polygon(
                        transposedCoords,
                        {
                            color: "black", // Outline color
                            weight: 0.5,
                            fillColor: getColorForIncome(income), // Fill color based on income
                            fillOpacity: 0.7
                        }
                    ).bindPopup(`Neighborhood: <h3>${neighborhoodName}</h3><p>Income: $${income.toLocaleString()}</p>`);
                    
                    oneOf77.push(polygon);
                }
                
                mapOutput.addLayer(L.layerGroup(oneOf77));
            } else {
                console.error("Income data is not in the expected format or is empty.");
            }
        }).catch(function(error) {
            console.error("Failed to load income data:", error);
        });
    } else {
        console.error("Chicago boundary data is not in the expected format or is empty.");
    }
}).catch(function(error) {
    console.error("Failed to load Chicago data:", error);
});

//---------------------------------------------------------------------------------------------------------
// Establish overlayMaps object/layers
//---------------------------------------------------------------------------------------------------------
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

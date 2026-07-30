// Global variables
let map;
let directionsService;
let directionsRenderer;
let stopCount = 0;
let autocompleteInstances = [];

// Initialize Google Maps
function initMap() {
    // Default center (e.g., center of US)
    const defaultCenter = { lat: 39.8283, lng: -98.5795 };

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: defaultCenter,
        mapTypeId: 'roadmap',
        // Dark mode styling for the map
        styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#263c3f" }],
            },
            {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#6b9a76" }],
            },
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }],
            },
            {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }],
            },
            {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }],
            },
            {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#746855" }],
            },
            {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#1f2835" }],
            },
            {
                featureType: "road.highway",
                elementType: "labels.text.fill",
                stylers: [{ color: "#f3d19c" }],
            },
            {
                featureType: "transit",
                elementType: "geometry",
                stylers: [{ color: "#2f3948" }],
            },
            {
                featureType: "transit.station",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }],
            },
            {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#515c6d" }],
            },
            {
                featureType: "water",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#17263c" }],
            },
        ],
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false // Let the renderer handle default markers with A, B, C labels
    });

    // Add initial stops
    addStop();
    addStop();
}

// DOM Elements
const stopsContainer = document.getElementById('stops-container');
const addStopBtn = document.getElementById('add-stop-btn');
const calculateBtn = document.getElementById('calculate-btn');
const mpgInput = document.getElementById('mpg');
const gasPriceInput = document.getElementById('gas-price');
const tourDaysInput = document.getElementById('tour-days');
const lodgingPriceInput = document.getElementById('lodging-price');
const crewCountInput = document.getElementById('crew-count');
const crewRateInput = document.getElementById('crew-rate');
const totalDistanceEl = document.getElementById('total-distance');
const totalTimeEl = document.getElementById('total-time');
const totalCostEl = document.getElementById('total-cost');
const lodgingCostEl = document.getElementById('lodging-cost');
const crewCostEl = document.getElementById('crew-cost');
const grandTotalEl = document.getElementById('grand-total');
const legsBreakdownEl = document.getElementById('legs-breakdown');
const errorMessageEl = document.getElementById('error-message');
const downloadPdfBtn = document.getElementById('download-pdf-btn');

// Add event listeners
addStopBtn.addEventListener('click', addStop);
calculateBtn.addEventListener('click', calculateRoute);
if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', generatePDF);
}

// Function to add a stop input
function addStop() {
    stopCount++;
    const stopId = `stop-${stopCount}`;

    const stopEl = document.createElement('div');
    stopEl.className = 'stop-item';
    stopEl.draggable = true;
    stopEl.dataset.id = stopId;

    stopEl.innerHTML = `
        <span class="drag-handle" title="Drag to reorder">☰</span>
        <input type="text" id="${stopId}" class="stop-input" placeholder="Enter venue or city (Stop ${stopsContainer.children.length + 1})">
        <button class="remove-btn" onclick="removeStop(this)" title="Remove Stop">✕</button>
    `;

    stopsContainer.appendChild(stopEl);
    updateStopPlaceholders();

    // Add drag and drop listeners
    addDragListeners(stopEl);

    // Make it an autocomplete field if Google Maps API is loaded
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        const input = document.getElementById(stopId);
        const autocomplete = new google.maps.places.Autocomplete(input);
        autocompleteInstances.push({ id: stopId, autocomplete: autocomplete });
    }
}

// Function to remove a stop
function removeStop(btn) {
    if (stopsContainer.children.length <= 2) {
        showError("You need at least 2 stops for a route.");
        return;
    }

    const stopEl = btn.parentElement;
    const stopId = stopEl.dataset.id;

    // Remove from DOM
    stopsContainer.removeChild(stopEl);

    // Remove from autocomplete instances
    autocompleteInstances = autocompleteInstances.filter(inst => inst.id !== stopId);

    updateStopPlaceholders();
}

// Update placeholders to reflect the order
function updateStopPlaceholders() {
    const inputs = stopsContainer.querySelectorAll('.stop-input');
    inputs.forEach((input, index) => {
        input.placeholder = `Enter venue or city (Stop ${index + 1})`;
    });
}

// Show error message
function showError(message) {
    errorMessageEl.textContent = message;
    errorMessageEl.classList.remove('hidden');
    setTimeout(() => {
        errorMessageEl.classList.add('hidden');
    }, 5000);
}

// --- Drag and Drop Logic ---
let draggedItem = null;

function addDragListeners(item) {
    item.addEventListener('dragstart', function(e) {
        draggedItem = item;
        setTimeout(() => {
            item.style.display = 'none';
        }, 0);
    });

    item.addEventListener('dragend', function(e) {
        setTimeout(() => {
            draggedItem.style.display = 'flex';
            draggedItem = null;
            updateStopPlaceholders();
        }, 0);
    });

    item.addEventListener('dragover', function(e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(stopsContainer, e.clientY);
        if (afterElement == null) {
            stopsContainer.appendChild(draggedItem);
        } else {
            stopsContainer.insertBefore(draggedItem, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.stop-item:not([style*="display: none"])')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}


// --- Routing and Calculation Logic ---
function calculateRoute() {
    errorMessageEl.classList.add('hidden');
    if (downloadPdfBtn) downloadPdfBtn.classList.add('hidden');
    legsBreakdownEl.innerHTML = '';
    totalDistanceEl.textContent = '0 mi';
    totalTimeEl.textContent = '0 min';
    totalCostEl.textContent = '$0.00';
    lodgingCostEl.textContent = '$0.00';
    crewCostEl.textContent = '$0.00';
    grandTotalEl.textContent = '$0.00';

    const inputs = [...stopsContainer.querySelectorAll('.stop-input')];
    const waypoints = inputs.map(input => input.value).filter(val => val.trim() !== '');

    if (waypoints.length < 2) {
        showError("Please enter at least an origin and a destination.");
        return;
    }

    const origin = waypoints[0];
    const destination = waypoints[waypoints.length - 1];
    const waypts = waypoints.slice(1, waypoints.length - 1).map(location => ({
        location: location,
        stopover: true
    }));

    const request = {
        origin: origin,
        destination: destination,
        waypoints: waypts,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
    };

    // Show loading state on button
    const originalBtnText = calculateBtn.textContent;
    calculateBtn.textContent = 'Calculating...';
    calculateBtn.disabled = true;

    directionsService.route(request, function(response, status) {
        calculateBtn.textContent = originalBtnText;
        calculateBtn.disabled = false;

        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(response);
            processRouteData(response.routes[0]);
        } else {
            if (status === 'ZERO_RESULTS') {
                showError("No valid route found between these locations. Make sure it's possible to drive there.");
            } else {
                showError('Directions request failed due to ' + status);
            }
            directionsRenderer.setDirections({routes: []}); // Clear previous route on map
        }
    });
}

function processRouteData(route) {
    let totalMiles = 0;
    let totalSeconds = 0;

    // Process each leg of the trip
    route.legs.forEach((leg, index) => {
        // Distance in meters to miles
        const legMiles = (leg.distance.value * 0.000621371).toFixed(1);
        totalMiles += parseFloat(legMiles);

        // Duration in seconds
        totalSeconds += leg.duration.value;

        // Create breakdown list item
        const li = document.createElement('li');
        // Extract city/state if possible for cleaner output
        const startAddress = formatAddress(leg.start_address);
        const endAddress = formatAddress(leg.end_address);

        li.innerHTML = `<strong>Leg ${index + 1}:</strong> ${startAddress} to ${endAddress}<br>
                        <em>${legMiles} miles, ${leg.duration.text}</em>`;
        legsBreakdownEl.appendChild(li);
    });

    // Calculate overall time formatting
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    let timeString = '';
    if (hours > 0) timeString += `${hours} hr `;
    timeString += `${minutes} min`;

    // Update summary UI
    totalDistanceEl.textContent = `${totalMiles.toFixed(1)} mi`;
    totalTimeEl.textContent = timeString;

    // Calculate cost
    calculateCost(totalMiles);

    // Show PDF button
    if (downloadPdfBtn) downloadPdfBtn.classList.remove('hidden');
}

function generatePDF() {
    const summaryHtml = document.querySelector('.summary-card').innerHTML;
    const legsHtml = document.getElementById('legs-breakdown').innerHTML;

    // Build HTML string formatted like an old MapQuest printout
    const htmlString = `
        <div style="padding: 40px; font-family: 'Courier New', Courier, monospace; color: #000; background: #fff; line-height: 1.6;">
            <h1 style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 30px; text-transform: uppercase;">Tour Routing & Cost Summary</h1>

            <h2 style="text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 15px;">Results</h2>
            <div style="border: 2px solid #000; padding: 20px; margin-bottom: 30px; background-color: #f9f9f9;">
                ${summaryHtml}
            </div>

            <h2 style="text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 15px;">Leg Breakdown</h2>
            <ul style="list-style: none; padding: 0;">
                ${legsHtml.replace(/<li>/g, '<li style="padding: 15px 0; border-bottom: 1px dashed #666;">')}
            </ul>

            <div style="margin-top: 40px; text-align: center; font-size: 0.8em; color: #666;">
                Generated by Tour Router - Drive Safe!
            </div>
        </div>
    `;

    const opt = {
        margin:       0.5,
        filename:     'tour-summary.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(htmlString).save();
}

function calculateCost(totalMiles) {
    let mpg = parseFloat(mpgInput.value);
    let gasPrice = parseFloat(gasPriceInput.value);

    // Handle edge cases where input might be invalid or empty
    if (isNaN(mpg) || mpg <= 0) {
        mpg = 10; // Default fallback as specified
        mpgInput.value = 10;
    }
    if (isNaN(gasPrice) || gasPrice <= 0) {
        gasPrice = 3.50; // Arbitrary fallback
        gasPriceInput.value = 3.50;
    }

    const gallonsNeeded = totalMiles / mpg;
    const totalCost = gallonsNeeded * gasPrice;

    let tourDays = parseInt(tourDaysInput.value) || 0;
    let lodgingPrice = parseFloat(lodgingPriceInput.value) || 0;
    let crewCount = parseInt(crewCountInput.value) || 0;
    let crewRate = parseFloat(crewRateInput.value) || 0;

    let lodgingCost = tourDays * lodgingPrice;
    let crewCost = tourDays * crewCount * crewRate;
    let grandTotal = totalCost + lodgingCost + crewCost;

    totalCostEl.textContent = `$${totalCost.toFixed(2)}`;
    lodgingCostEl.textContent = `$${lodgingCost.toFixed(2)}`;
    crewCostEl.textContent = `$${crewCost.toFixed(2)}`;
    grandTotalEl.textContent = `$${grandTotal.toFixed(2)}`;
}

// Helper to simplify full addresses to City, State (if available)
function formatAddress(fullAddress) {
    // A simple heuristic: split by comma.
    // Usually full addresses are "123 Main St, City, State ZIP, Country"
    // We try to grab the City, State part if it has enough commas
    const parts = fullAddress.split(',');
    if (parts.length >= 3) {
        // Typically parts[parts.length-3] is city, parts[parts.length-2] is State Zip
        const city = parts[parts.length - 3].trim();
        const stateZip = parts[parts.length - 2].trim().split(' ')[0]; // Just try to get State abbreviation
        return `${city}, ${stateZip}`;
    }
    // Fallback to original if we can't easily parse it
    return fullAddress;
}

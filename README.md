# Tour Drive & Gas Calculator

A single-page web application designed to help touring bands calculate drive times, distances, and gas costs between tour dates .

## Features
- Dynamic itinerary builder with Google Places Autocomplete.
- Drag-and-drop tour stop reordering.
- Route visualization using Google Maps.
- Drive time and distance breakdown for each leg of the tour.
- Gas cost estimation based on configurable MPG and Gas Prices
- Crew cost calculator 
- Clean, responsive dark-mode UI.

## Setup Instructions (if using your own Google Maps API)

1. **Obtain a Google Maps API Key:**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project or select an existing one.
   - Enable the following APIs:
     - **Maps JavaScript API**
     - **Places API**
     - **Directions API**
   - Go to "Credentials" and create an API Key.
   - Restrict your API key to only allow requests from your specific domain (once deployed) for security.

2. **Add Your API Key to the Code:**
   - Open `index.html`.
   - Locate the script tag at the bottom of the body:
     ```html
     <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places&callback=initMap"></script>
     ```
   - Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key.


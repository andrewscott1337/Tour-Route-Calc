# Tour Drive & Gas Calculator

A single-page web application designed to help touring bands calculate drive times, distances, and gas costs between tour dates .

## Features
- Dynamic itinerary builder with Google Places Autocomplete.
- Drag-and-drop tour stop reordering.
- Route visualization using Google Maps.
- Drive time and distance breakdown for each leg of the tour.
- Gas cost estimation based on configurable MPG and Gas Prices.
- Clean, responsive dark-mode UI.

## Setup Instructions

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

## Deploying to GitHub Pages

Because this is a static site (HTML, CSS, JS only), it is incredibly easy to host for free using GitHub Pages.

1. **Create a GitHub Repository:**
   - Go to GitHub and create a new repository (e.g., `tour-calculator`).
   - Do not initialize it with a README (you already have these files).

2. **Push the Code:**
   - Initialize a local git repository in this folder: `git init`
   - Add the files: `git add .`
   - Commit the files: `git commit -m "Initial commit"`
   - Link to your GitHub repo: `git remote add origin https://github.com/yourusername/tour-calculator.git`
   - Push the code: `git push -u origin main` (or `master`)

3. **Enable GitHub Pages:**
   - On GitHub, go to your repository's **Settings**.
   - Navigate to the **Pages** section on the left sidebar.
   - Under **Source**, select the branch you pushed to (e.g., `main`) and the root folder `/`.
   - Click **Save**.
   - GitHub will display a message indicating your site is ready to be published at a specific URL (e.g., `https://yourusername.github.io/tour-calculator/`). It may take a minute or two to go live.

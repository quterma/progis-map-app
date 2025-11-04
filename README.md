# Progis Map App

A lightweight **React + TypeScript** demo application for displaying and querying geospatial data (WMS/OGC).  
Built with **Vite** and **Leaflet**, following a minimal clean-architecture approach.

## Deployed on gh-pages

https://quterma.github.io/progis-map-app/

## Features

- Leaflet map with CartoDB base tiles
- WMS GetFeatureInfo identify on click → popup with feature attributes
- Populated places information via ahocevar GeoServer
- Enhanced error handling with retry logic for service availability
- Optional auto-center to user geolocation (fallback → USA)
- Modular folder structure: `domain / infrastructure / ui / shared`

## Run locally

```bash
npm install
npm run dev
```

## Architecture

Domain – core types and use-cases (UI-agnostic)
Infrastructure – Leaflet & WMS adapters  
UI – MapWidget with identify functionality
Shared – WMS configs & utils

For MVP the UI directly uses adapter calls; domain interfaces are prepared for future separation.

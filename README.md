# Progis Map App

A lightweight **React + TypeScript** demo application for displaying and querying geospatial data (WMS/OGC).  
Built with **Vite** and **Leaflet**, following a minimal clean-architecture approach.

## Deployed on gh-pages

https://quterma.github.io/progis-map-app/

## Features

- Leaflet map with OSM base tiles
- Clean map interface with configurable layer system
- Identify (WMS GetFeatureInfo) → popup with feature attributes
- Smart hybrid identify:
  - reverse geocode (street/building) on high zoom via OpenStreetMap Nominatim
  - country info via WMS on low zoom
- Optional auto-center to user geolocation (fallback → USA)
- Modular folder structure: `infrastructure / ui / shared`

## Cleanup History

**2025-11-04:** Removed unused architecture layers (`domain/`, `app/`, `mocks/`) and demo OSM-WMS layer to focus on core map functionality. The codebase now follows a simpler, production-ready structure.

## Run locally

```bash
npm install
npm run dev
```

## Architecture

Domain – core types and use-cases (UI-agnostic)
Infrastructure – Leaflet & OGC adapters
UI – MapWidget + LayersPanel
Shared – configs & utils

For MVP the UI directly uses adapter calls; domain interfaces are prepared for future separation.

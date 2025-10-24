# Progis Map App

A lightweight **React + TypeScript** demo application for displaying and querying geospatial data (WMS/OGC).  
Built with **Vite** and **Leaflet**, following a minimal clean-architecture approach.

## Features

- Leaflet map with OSM base tiles
- Toggleable WMS overlay (OSM-WMS demo layer)
- Identify (WMS GetFeatureInfo) → popup with feature attributes
- Smart hybrid identify:
  - reverse geocode (street/building) on high zoom via OpenStreetMap Nominatim
  - country info via WMS on low zoom
- Optional auto-center to user geolocation (fallback → USA)
- Modular folder structure: `domain / infrastructure / ui / shared`

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

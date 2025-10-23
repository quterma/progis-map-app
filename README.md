# Progis Map App

A lightweight React + TypeScript demo application displaying geospatial data via WMS (OGC) services.  
Built with **Vite** and **Leaflet**, following a simple clean-architecture pattern.

## Features

- Map rendering with Leaflet and OSM base tiles
- WMS layer integration (`topp:states` demo via proxy)
- Identify (GetFeatureInfo) on map click → popup with feature attributes
- Modular folder structure (domain / app / infrastructure / ui / shared)

## Run locally

```bash
npm install
npm run dev
```

## Architecture

domain — core types and logic,
infrastructure — adapters for map & services,
ui — React components (MapWidget),
shared — config/utils.

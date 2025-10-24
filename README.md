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

## Features

- Leaflet map with OSM base tiles
- Toggleable WMS overlay (OSM-WMS demo)
- Identify (WMS GetFeatureInfo) on click over `topp:states` (via Vite proxy)
- Clean, modular structure (domain / infrastructure / ui / shared)
- Optional auto-center to user location (fallback to USA)
- Identify by zoom: address at high zoom; country at low zoom

## Architecture

Domain (core types/use-cases, library-agnostic)
Infrastructure (Leaflet & OGC adapters)
UI (MapWidget + LayersPanel)
Shared (config/utils). For MVP, the UI calls adapter methods directly; domain interfaces are prepared for future decoupling.

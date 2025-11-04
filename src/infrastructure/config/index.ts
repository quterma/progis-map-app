/**
 * Centralized configuration for map, WMS/WFS, and GFI services
 */

// WMS Service Configuration
export const WMS_URL = import.meta.env.VITE_WMS_URL ?? '/wms';
export const WMS_VERSION = '1.1.1';
export const WMS_CRS = 'EPSG:4326';

// GetFeatureInfo Configuration
export const WMS_INFO_FORMAT = 'application/json';
export const WMS_FEATURE_COUNT = 10;
export const WMS_BUFFER = 10;

// Request Types
export const WMS_REQUEST_TYPES = {
  GET_FEATURE_INFO: 'GetFeatureInfo',
} as const;

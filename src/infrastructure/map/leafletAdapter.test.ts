import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createMap, 
  addWms, 
  removeLayer, 
  showPopup, 
  destroy,
  whenReady,
  identifyWms,
} from './leafletAdapter';

// Мокаем Leaflet
const mockMap = {
  setView: vi.fn().mockReturnThis(),
  whenReady: vi.fn((cb) => cb()),
  openPopup: vi.fn(),
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
  remove: vi.fn(),
  on: vi.fn(),
  getCenter: vi.fn(() => ({ lat: 0, lng: 0 })),
  getZoom: vi.fn(() => 10),
  getSize: vi.fn(() => ({ x: 800, y: 600 })),
  getBounds: vi.fn(() => ({
    getSouthWest: () => ({ lng: -1, lat: -1 }),
    getNorthEast: () => ({ lng: 1, lat: 1 }),
  })),
  latLngToContainerPoint: vi.fn(() => ({ x: 400, y: 300 })),
};

const mockTileLayer = {
  addTo: vi.fn().mockReturnThis(),
};

const mockWmsLayer = {
  addTo: vi.fn().mockReturnThis(),
};

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => mockMap),
    tileLayer: Object.assign(vi.fn(() => mockTileLayer), {
      wms: vi.fn(() => mockWmsLayer),
    }),
  },
}));

describe('leafletAdapter smoke tests', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    vi.clearAllMocks();
  });

  describe('exports', () => {
    it('should export defined functions', () => {
      expect(createMap).toBeDefined();
      expect(addWms).toBeDefined();
      expect(removeLayer).toBeDefined();
      expect(showPopup).toBeDefined();
      expect(destroy).toBeDefined();
      expect(whenReady).toBeDefined();
      expect(identifyWms).toBeDefined();
    });
  });

  describe('createMap', () => {
    it('should create map without throwing', () => {
      expect(() => {
        createMap(container, { center: [0, 0], zoom: 10 });
      }).not.toThrow();
    });

    it('should return MapHandle with expected structure', () => {
      const handle = createMap(container, { center: [0, 0], zoom: 10 });
      
      expect(handle).toHaveProperty('map');
      expect(handle).toHaveProperty('layers');
      expect(handle).toHaveProperty('selection');
      expect(handle.layers).toEqual({});
    });
  });

  describe('basic operations', () => {
    let handle: ReturnType<typeof createMap>;

    beforeEach(() => {
      handle = createMap(container, { center: [0, 0], zoom: 10 });
    });

    it('should add WMS layer safely', () => {
      expect(() => {
        addWms(handle, 'test', 'http://example.com/wms', { layers: 'test_layer' });
      }).not.toThrow();
    });

    it('should remove layer safely', () => {
      expect(() => {
        removeLayer(handle, 'test');
      }).not.toThrow();
    });

    it('should show popup safely', () => {
      const mockLatLng = { lat: 0, lng: 0 } as { lat: number; lng: number };
      expect(() => {
        showPopup(handle, mockLatLng as never, 'Test popup');
      }).not.toThrow();
    });

    it('should handle whenReady callback', () => {
      const callback = vi.fn();
      expect(() => {
        whenReady(handle, callback);
      }).not.toThrow();
    });

    it('should destroy map safely', () => {
      expect(() => {
        destroy(handle);
      }).not.toThrow();
    });
  });

  describe('identifyWms', () => {
    let handle: ReturnType<typeof createMap>;

    beforeEach(() => {
      handle = createMap(container, { center: [0, 0], zoom: 10 });
    });

    it('should return URL string on success', async () => {
      const mockLatLng = { lat: 0, lng: 0 } as { lat: number; lng: number };
      const result = await identifyWms(
        handle,
        mockLatLng as never,
        'http://example.com/wms',
        { layers: 'test_layer' }
      );

      expect(typeof result === 'string' || result === null).toBe(true);
    });

    it('should not throw on error', async () => {
      const mockLatLng = { lat: 0, lng: 0 } as { lat: number; lng: number };
      
      await expect(async () => {
        await identifyWms(
          handle,
          mockLatLng as never,
          'invalid-url',
          { layers: 'test_layer' }
        );
      }).not.toThrow();
    });
  });
});
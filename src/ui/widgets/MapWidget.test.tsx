import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MapWidget from './MapWidget';

// Мокаем Leaflet адаптер
vi.mock('../../infrastructure/map/leafletAdapter', () => ({
  createMap: vi.fn(() => ({ map: { getZoom: () => 10 } })),
  onMapClick: vi.fn(),
  showPopup: vi.fn(),
  destroy: vi.fn(),
  setView: vi.fn(),
  whenReady: vi.fn((_handle, callback) => callback()),
  identifyWms: vi.fn(() => Promise.resolve({})),
}));

describe('MapWidget', () => {
  it('should render map container', () => {
    render(<MapWidget />);

    // Проверяем что контейнер карты присутствует
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
    expect(mapContainer).toHaveClass('map-container');
  });

  it('should have correct container dimensions', () => {
    render(<MapWidget />);

    const mapContainer = screen.getByTestId('map-container');

    // Проверяем что width правильный
    expect(mapContainer).toHaveStyle({ width: '100%' });

    // Проверяем что height существует (браузер преобразует vh в px)
    const computedStyle = window.getComputedStyle(mapContainer);
    expect(computedStyle.height).toBeTruthy();
    expect(parseInt(computedStyle.height)).toBeGreaterThan(0);
  });
});

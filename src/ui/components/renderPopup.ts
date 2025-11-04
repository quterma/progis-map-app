import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import InfoPopup, { type CityInfo } from './InfoPopup';

export function renderPopup(data: CityInfo): HTMLElement {
  const el = document.createElement('div');
  createRoot(el).render(createElement(InfoPopup, { data }));
  return el;
}

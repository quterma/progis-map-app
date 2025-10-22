import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

import { ogcMock } from './infrastructure/mocks/ogcService.mock';
import { listLayers } from './domain/usecases';

listLayers(ogcMock).then((l) => console.log('layers:', l));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

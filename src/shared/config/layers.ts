export type WmsLayerDef = {
  id: string;
  title: string;
  url: string;
  params: {
    layers: string;
    format?: string;
    transparent?: boolean;
    version?: string;
    styles?: string;
  };
};

export const LAYERS: WmsLayerDef[] = [
  {
    id: 'osm',
    title: 'OSM (WMS)',
    url: 'https://ows.terrestris.de/osm/service?',
    params: {
      layers: 'OSM-WMS',
      format: 'image/png',
      transparent: true,
      version: '1.1.1',
      styles: '',
    },
  },
  // сюда легко добавить ещё { id:'...', title:'...', url:'...', params:{...} }
];

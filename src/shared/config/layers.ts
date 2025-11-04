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
  // сюда легко добавить ещё { id:'...', title:'...', url:'...', params:{...} }
];

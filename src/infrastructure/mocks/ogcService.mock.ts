import type { OGCServicePort } from '../../domain/ports';
import type { Layer, Feature, MapState, Point } from '../../domain/types';

export const ogcMock: OGCServicePort = {
  async listLayers(): Promise<Layer[]> {
    return [
      { id: 'roads', name: 'Roads', kind: 'WMS', visible: true },
      { id: 'buildings', name: 'Buildings', kind: 'WFS', visible: false },
    ];
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async identifyAt(_input: {
    layerId: string;
    point: Point;
    view: MapState;
  }): Promise<Feature[]> {
    return [{ id: 1, geometry: { type: 'Point' }, props: { name: 'Sample' } }];
  },
};

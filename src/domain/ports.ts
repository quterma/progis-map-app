import type { Layer, Feature, MapState, Point } from './types';

export interface OGCServicePort {
  listLayers(): Promise<Layer[]>;
  identifyAt(input: {
    layerId: string;
    point: Point;
    view: MapState;
  }): Promise<Feature[]>;
}

import { GeoJsonSchema, Projection } from '@common/geolib'
import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import OlProjection from 'ol/proj/Projection'
import VectorSource from 'ol/source/Vector'
import { MapAddon } from './addon'
import { StyleFunction } from 'ol/style/Style'
import { Feature } from 'ol'

export interface FeatureAddonOpts<Input> {
  identifier: string
  feature: Input
  styleFunction?: StyleFunction
  dataProjection?: Projection
}

export class FeatureAddon<Input = Feature[]> extends MapAddon {
  source: VectorSource
  layer: VectorLayer
  olFeatures: Feature[]

  constructor(public input: FeatureAddonOpts<Input>) {
    super(input.identifier)
    this.source = new VectorSource()
    this.olFeatures = this.getOlFeatures(this.input.feature)
    this.source.addFeatures(this.olFeatures)
    this.layer = new VectorLayer({
      source: this.source,
      style: input.styleFunction,
    })
  }

  getOlFeatures(input: Input): Feature[] {
    return input as any
  }

  override getLayers() {
    return [this.layer]
  }

  override getExtent = () => {
    const out = this.olFeatures
      .map((feature) => {

        return feature?.getGeometry()!.getExtent()

      })
      .reduce(
        (out, line) => {
          return [
            Math.min(out[0], line[0]),
            Math.min(out[1], line[1]),
            Math.max(out[2], line[2]),
            Math.max(out[3], line[3]),
          ]
        },
        [Infinity, Infinity, -Infinity, -Infinity]
      )
    return out
  }
}

export class GeoJsonFeatureAddon extends FeatureAddon<GeoJsonSchema> {
  override getOlFeatures(input: GeoJsonSchema) {
    return getOlFeatures(input, this.input.dataProjection)
  }
}

export function getOlFeatures(
  input: GeoJsonSchema,
  dataProjection: Projection = Projection.LatLon
) {
  const geoJson = new GeoJSON()
  const olFeatures =
    input.type === 'FeatureCollection'
      ? geoJson.readFeatures(input, {
        dataProjection: getOLProjection(dataProjection),
        featureProjection: getOLProjection(Projection.Meters),
      })
      : [
        geoJson.readFeature(input, {
          dataProjection: getOLProjection(dataProjection),
          featureProjection: getOLProjection(Projection.Meters),
        }),
      ]
  return olFeatures
}

export function getOLProjection(proj: Projection) {
  if (proj === Projection.Meters) {
    return new OlProjection({
      code: 'EPSG:3857',
      units: 'm',
    })
  } else if (proj == Projection.Area) {
    return new OlProjection({
      code: 'EPSG:98056',
    })
  } else {
    return new OlProjection({
      code: 'EPSG:4326',
    })
  }
}

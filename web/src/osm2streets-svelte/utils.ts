import turfBbox from "@turf/bbox";
import type { Feature, FeatureCollection, GeoJSON, Geometry } from "geojson";
import { get } from "svelte/store";
import { map as mapStore } from "./store";

// TODO Why can't I find an NPM package to do this?
export function downloadGeneratedFile(filename: string, textInput: string) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8, " + encodeURIComponent(textInput)
  );
  element.setAttribute("download", filename);
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Helper for https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#case based on one property
export function caseHelper(
  getKey: string,
  map: { [name: string]: string },
  backup: string
): any[] {
  let x: any[] = ["case"];
  for (let [key, value] of Object.entries(map)) {
    x.push(["==", ["get", getKey], key]);
    x.push(value);
  }
  x.push(backup);
  return x;
}

export function featureStateToggle(
  key: string,
  falseCase: number,
  trueCase: number
): any[] {
  return [
    "case",
    ["boolean", ["feature-state", key], false],
    trueCase,
    falseCase,
  ];
}

export function emptyGeojson(): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [],
  };
}

// Suitable for passing to map.fitBounds. Work around https://github.com/Turfjs/turf/issues/1807.
export function bbox(gj: GeoJSON): [number, number, number, number] {
  return turfBbox(gj) as [number, number, number, number];
}

// Properties are guaranteed to exist
export type FeatureWithProps<G extends Geometry> = Feature<G> & {
  properties: { [name: string]: any };
};

export function getLayerZorder(layer: string): string | undefined {
  let map = get(mapStore)!;
  // layerZorder lists all layers in the desired z-order. map.addLayer takes an
  // optional beforeId, placing the new layer beneath this beforeId. Due to
  // hot-module reloading and Svelte component initialization being
  // unpredictable, we might add layers in any order, so use beforeId
  // to guarantee we wind up in the correct order.
  //
  // Find the last layer currently in the map that should be on top of this new
  // layer.
  let beforeId: string | undefined;
  let found = false;
  for (let i = layerZorder.length - 1; i >= 0; i--) {
    let id = layerZorder[i];
    if (id == layer) {
      found = true;
      break;
    }
    if (map.getLayer(id)) {
      beforeId = id;
    }
  }
  // When adding a new layer somewhere, force the programmer to decide where it
  // should be z-ordered.
  if (!found) {
    throw new Error(`Layer ID ${layer} not defined in layerZorder`);
  }
  // If beforeId isn't set, we'll add the layer on top of everything else.
  return beforeId;
}

// Later entries are drawn on top
const layerZorder = [
  "boundary-layer",
  "lane-polygons-layer",
  "intersection-polygons-layer",
  "lane-markings-layer",
  "intersection-markings-layer",

  "movements-layer",
  "connected-roads-layer",

  // TODO This is specific to lane-editor. Figure out how different apps can
  // build on top of the osm2streets-svelte common ordering.
  "current-way-layer",

  // Draw most things beneath text road labels. This is the only layer in this
  // list generated by the MapTiler basemap we use.
  "road_label",
];

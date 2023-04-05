export type Path = number[];
export interface SchemaSlice {
  path: Path;
  current: number; // index of the slice taking into account all slices with same path
  leadPage: number; // starting page
  upperBound: number; // starting lenght
  lowerBound: number; // ending length head tail
  addedHeight: number; // Cumulative height of slices in the page
}

export type SchemaPage = SchemaSlice[];
export type SchemaColumn = SchemaPage[];
export type Schema = SchemaColumn[];

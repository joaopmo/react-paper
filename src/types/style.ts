export interface PartialStyle<T> {
  contentBox: T;
  borderBox: T;
  marginBox: T;
  fontSize: T;
  rowGap: T;
  lineHeight: T;
  marginTop: T;
  marginBottom: T;
  paddingTop: T;
  paddingBottom: T;
  borderTop: T;
  borderBottom: T;
}

export interface Style<T> extends PartialStyle<T> {
  display: string;
}

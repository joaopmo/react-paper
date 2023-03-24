import { Path } from '../components/Field';

export interface ElStyle<T> {
  // marginBox: T;
  contentBox: T;
  borderBox: T;
  fontSize: T;
  lineHeight: T;
  marginTop: T;
  marginBottom: T;
  paddingTop: T;
  paddingBottom: T;
  borderTop: T;
  borderBottom: T;
}

export interface ElMeta<T> extends Partial<ElStyle<T>> {
  path: Path;
}

export const getStyle = (el: Element): ElStyle<number> => {
  const style = window.getComputedStyle(el);

  const properties: ElStyle<string> = {
    // marginBox: 'height',
    borderBox: 'height',
    contentBox: 'height',
    fontSize: 'font-size',
    lineHeight: 'line-height',
    marginTop: 'margin-top',
    marginBottom: 'margin-bottom',
    paddingTop: 'padding-top',
    paddingBottom: 'padding-bottom',
    borderTop: 'border-top',
    borderBottom: 'border-bottom',
  };

  const sizes = Object.entries(properties).reduce<ElStyle<number>>((acc, [key, val]) => {
    acc[key as keyof ElStyle<number>] = parseFloat(style.getPropertyValue(val)) || 0;
    return acc;
  }, {} as ElStyle<number>);

  if (style.getPropertyValue('box-sizing') === 'border-box') {
    // sizes.marginBox += sizes.marginTop + sizes.marginBottom;
    sizes.contentBox -= sizes.paddingTop + sizes.paddingBottom;
    sizes.contentBox -= sizes.borderTop + sizes.borderBottom;
  } else {
    // sizes.marginBox += sizes.paddingTop + sizes.paddingBottom;
    // sizes.marginBox += sizes.borderTop + sizes.borderBottom;
    // sizes.marginBox += sizes.marginTop + sizes.marginBottom;

    sizes.borderBox += sizes.paddingTop + sizes.paddingBottom;
    sizes.borderBox += sizes.borderTop + sizes.borderBottom;
  }

  return sizes;
};

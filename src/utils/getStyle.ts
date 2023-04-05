import { type Style } from '../types';

const properties: Style<string> = {
  borderBox: 'height',
  contentBox: 'height',
  fontSize: 'font-size',
  lineHeight: 'line-height',
  marginTop: 'margin-top',
  marginBottom: 'margin-bottom',
  paddingTop: 'padding-top',
  paddingBottom: 'padding-bottom',
  borderTop: 'border-top-width',
  borderBottom: 'border-bottom-width',
};
export const getStyle = (el: Element): Style<number> => {
  const style = window.getComputedStyle(el);

  const sizes = Object.entries(properties).reduce<Style<number>>((acc, [key, val]) => {
    const valIsNan = Number.isNaN(parseFloat(style.getPropertyValue(val)));
    acc[key as keyof Style<number>] = valIsNan ? 0 : parseFloat(style.getPropertyValue(val));
    return acc;
  }, {} as Style<number>); // eslint-disable-line

  if (style.getPropertyValue('box-sizing') === 'border-box') {
    sizes.contentBox -= sizes.paddingTop + sizes.paddingBottom;
    sizes.contentBox -= sizes.borderTop + sizes.borderBottom;
  } else {
    sizes.borderBox += sizes.paddingTop + sizes.paddingBottom;
    sizes.borderBox += sizes.borderTop + sizes.borderBottom;
  }

  return sizes;
};

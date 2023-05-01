import { type Style, type PartialStyle } from '../types';

const properties: PartialStyle<string> = {
  borderBox: 'height',
  contentBox: 'height',
  marginBox: 'height',
  rowGap: 'row-gap',
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

  const partialSizes = Object.entries(properties).reduce<PartialStyle<number>>(
    (acc, [key, val]) => {
      const valIsNan = Number.isNaN(parseFloat(style.getPropertyValue(val)));
      acc[key as keyof PartialStyle<number>] = valIsNan
        ? 0
        : parseFloat(style.getPropertyValue(val));
      return acc;
    },
    // eslint-disable-next-line
    {} as PartialStyle<number>,
  );

  const sizes: Style<number> = { ...partialSizes, display: style.getPropertyValue('display') };

  if (style.getPropertyValue('box-sizing') === 'border-box') {
    sizes.contentBox -= sizes.paddingTop + sizes.paddingBottom;
    sizes.contentBox -= sizes.borderTop + sizes.borderBottom;
    sizes.marginBox += sizes.marginTop + sizes.marginBottom;
  } else {
    sizes.borderBox += sizes.paddingTop + sizes.paddingBottom;
    sizes.borderBox += sizes.borderTop + sizes.borderBottom;
    sizes.marginBox += sizes.paddingTop + sizes.paddingBottom;
    sizes.marginBox += sizes.borderTop + sizes.borderBottom;
    sizes.marginBox += sizes.marginTop + sizes.marginBottom;
  }

  return sizes;
};

import { Path } from '../components/Field';
import Big from 'big.js';

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

export const getStyle = (el: Element, scale?: number): ElStyle<Big> => {
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
    borderTop: 'border-top-width',
    borderBottom: 'border-bottom-width',
  };

  const sizes = Object.entries(properties).reduce<ElStyle<Big>>((acc, [key, val]) => {
    acc[key as keyof ElStyle<Big>] = new Big(parseFloat(style.getPropertyValue(val)) || 0);
    return acc;
  }, {} as ElStyle<Big>);

  // for (const [key, val] of Object.entries(sizes)) {
  //   console.log(key, val.toString());
  // }
  // console.log('-');

  if (style.getPropertyValue('box-sizing') === 'border-box') {
    // sizes.marginBox += sizes.marginTop + sizes.marginBottom;
    sizes.contentBox = sizes.contentBox.minus(sizes.paddingTop.plus(sizes.paddingBottom));
    // sizes.contentBox -= sizes.paddingTop + sizes.paddingBottom;
    sizes.contentBox = sizes.contentBox.minus(sizes.borderTop.plus(sizes.borderBottom));
    // sizes.contentBox -= sizes.borderTop + sizes.borderBottom;
  } else {
    // sizes.marginBox += sizes.paddingTop + sizes.paddingBottom;
    // sizes.marginBox += sizes.borderTop + sizes.borderBottom;
    // sizes.marginBox += sizes.marginTop + sizes.marginBottom;
    sizes.borderBox = sizes.borderBox.plus(sizes.paddingTop.plus(sizes.paddingBottom));
    // sizes.borderBox += sizes.paddingTop + sizes.paddingBottom;
    sizes.borderBox = sizes.borderBox.plus(sizes.borderTop.plus(sizes.borderBottom));
    // sizes.borderBox += sizes.borderTop + sizes.borderBottom;
  }

  // for (const [key, val] of Object.entries(sizes)) {
  //   console.log(key, val.toString());
  // }
  // console.log('\n');

  return sizes;
};

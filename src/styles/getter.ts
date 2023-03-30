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

export const getStyle = (el: Element): ElStyle<number> => {
  const style = window.getComputedStyle(el);

  const properties: ElStyle<string> = {
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

  const sizes = Object.entries(properties).reduce<ElStyle<number>>((acc, [key, val]) => {
    acc[key as keyof ElStyle<number>] = parseFloat(style.getPropertyValue(val)) || 0;
    return acc;
  }, {} as ElStyle<number>);

  if (style.getPropertyValue('box-sizing') === 'border-box') {
    // sizes.contentBox = sizes.contentBox.minus(sizes.paddingTop.plus(sizes.paddingBottom));
    sizes.contentBox -= sizes.paddingTop + sizes.paddingBottom;
    // sizes.contentBox = sizes.contentBox.minus(sizes.borderTop.plus(sizes.borderBottom));
    sizes.contentBox -= sizes.borderTop + sizes.borderBottom;
  } else {
    // sizes.borderBox = sizes.borderBox.plus(sizes.paddingTop.plus(sizes.paddingBottom));
    sizes.borderBox += sizes.paddingTop + sizes.paddingBottom;
    // sizes.borderBox = sizes.borderBox.plus(sizes.borderTop.plus(sizes.borderBottom));
    sizes.borderBox += sizes.borderTop + sizes.borderBottom;
  }

  return sizes;
};

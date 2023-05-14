import { type AtLeastOne, type PartialStyle, type Style } from '../types';

const baseProperties: PartialStyle<string> = {
  borderBox: 'height',
  contentBox: 'height',
  rowGap: 'row-gap',
  lineHeight: 'line-height',
  marginTop: 'margin-top',
  marginBottom: 'margin-bottom',
  paddingTop: 'padding-top',
  paddingBottom: 'padding-bottom',
  borderTop: 'border-top-width',
  borderBottom: 'border-bottom-width',
};

interface BoxSizing {
  boxSizing: string;
}

interface Display {
  display: string;
}

type FilledStyle<T> = AtLeastOne<Partial<PartialStyle<T>>>;
type StringOrFilledStyle = BoxSizing | Display | FilledStyle<string>;

function isBoxSizing(props: object): props is BoxSizing {
  return Object.hasOwn(props, 'boxSizing');
}

function isDisplay(props: object): props is Display {
  return Object.hasOwn(props, 'display');
}

function unwrapBorders({
  paddingTop,
  paddingBottom,
  borderTop,
  borderBottom,
}: FilledStyle<string>) {
  return {
    paddingTop,
    paddingBottom,
    borderTop,
    borderBottom,
  };
}

function getPartialStyle(
  el: Element,
  props: FilledStyle<string>,
): Record<keyof typeof props, number>;

function getPartialStyle(el: Element, props: BoxSizing): BoxSizing;

function getPartialStyle(el: Element, props: Display): Display;

function getPartialStyle(el: Element, props: StringOrFilledStyle): unknown {
  const style = window.getComputedStyle(el);

  if (isBoxSizing(props)) {
    return {
      boxSizing: style.getPropertyValue(props.boxSizing),
    };
  }

  if (isDisplay(props)) {
    return {
      display: style.getPropertyValue(props.display),
    };
  }

  return Object.entries(props).reduce<FilledStyle<number>>(
    (acc, [key, val]) => {
      const value = parseFloat(style.getPropertyValue(val));
      acc[key as keyof FilledStyle<number>] = Number.isNaN(value) ? 0 : value;
      return acc;
    },
    // eslint-disable-next-line
    {} as FilledStyle<number>,
  );
}

type StringOrPartialStyleKeys = keyof PartialStyle<string> | keyof BoxSizing | keyof Display;

export function getStyle(el: Element, prop: keyof PartialStyle<string>): number;

export function getStyle(el: Element, prop: keyof BoxSizing): string;

export function getStyle(el: Element, prop: keyof Display): string;

export function getStyle(el: Element): Style<number>;
export function getStyle(el: Element, prop?: StringOrPartialStyleKeys): unknown {
  const boxSizing: BoxSizing = { boxSizing: 'box-sizing' };
  const display: Display = { display: 'display' };

  if (prop != null) {
    if (prop === 'boxSizing') {
      return getPartialStyle(el, boxSizing).boxSizing;
    }

    if (prop === 'display') {
      return getPartialStyle(el, display).display;
    }

    let { [prop]: value } = getPartialStyle(el, {
      [prop]: baseProperties[prop],
    });

    if (prop === 'contentBox' && getPartialStyle(el, boxSizing).boxSizing === 'border-box') {
      const borders = getPartialStyle(el, unwrapBorders(baseProperties));
      Object.values(borders).forEach((border: number) => {
        value -= border;
      });
    }

    if (prop === 'borderBox' && getPartialStyle(el, boxSizing).boxSizing !== 'border-box') {
      const borders = getPartialStyle(el, unwrapBorders(baseProperties));
      Object.values(borders).forEach((border: number) => {
        value += border;
      });
    }

    return value;
  }

  const partialSizes = getPartialStyle(el, baseProperties);

  const { display: displayValue } = getPartialStyle(el, display);
  const sizes: Style<number> = { ...partialSizes, display: displayValue };

  if (getPartialStyle(el, { boxSizing: 'box-sizing' }).boxSizing === 'border-box') {
    sizes.contentBox -= sizes.paddingTop + sizes.paddingBottom;
    sizes.contentBox -= sizes.borderTop + sizes.borderBottom;
  } else {
    sizes.borderBox += sizes.paddingTop + sizes.paddingBottom;
    sizes.borderBox += sizes.borderTop + sizes.borderBottom;
  }

  return sizes;
}

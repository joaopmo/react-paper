import React from 'react';

interface DimensionObject {
  scale: number;
  marginRight: number;
  marginBottom: number;
  height: number;
  width: number;
}

const DimensionContext = React.createContext<DimensionObject>({
  scale: 1,
  marginRight: 0,
  marginBottom: 0,
  height: 0,
  width: 0,
});

export function useDimension(): DimensionObject {
  return React.useContext(DimensionContext);
}

interface DimensionProviderProps {
  widthFrac: number;
  multiplier: number;
  children: React.ReactNode;
}

export function DimensionProvider({
  widthFrac,
  multiplier,
  children,
}: DimensionProviderProps): React.ReactNode {
  const dimensionRef = React.useRef<HTMLElement | null>(null);
  const [dimensions, setDimensions] = React.useState<DimensionObject>({
    scale: 1,
    marginRight: 0,
    marginBottom: 0,
    height: 0,
    width: 0,
  });

  const reference = React.useCallback(
    (ref: HTMLElement | null) => {
      if (ref !== null) dimensionRef.current = ref;
    },
    [dimensionRef],
  );

  const resizeHandler = React.useCallback(() => {
    // A4 = 297mm x 210mm
    const height = 297 * multiplier;
    const width = 210 * multiplier;
    const container = dimensionRef.current;

    if (container !== null) {
      const wrapWidth = container.offsetWidth;
      const docWidth = wrapWidth * widthFrac;

      // transform: scale();
      // scale() is only a visual effect, it doesn't affect the computed DOM layout.
      // Negative margins help remove white space and overflow
      const scale = docWidth / width;
      const marginRight = width * scale - width;
      const marginBottom = height * scale - height;

      setDimensions((prevState) => {
        switch (true) {
          case prevState.scale !== scale:
          case prevState.marginRight !== marginRight:
          case prevState.marginBottom !== marginBottom:
          case prevState.height !== height:
          case prevState.width !== width:
            return { scale, marginRight, marginBottom, height, width };
          default:
            return prevState;
        }
      });
    }
  }, [dimensionRef, widthFrac, multiplier]);

  React.useLayoutEffect(() => {
    window.addEventListener('resize', resizeHandler);
    resizeHandler();

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [resizeHandler]);

  return (
    <div className="rp-dimension" ref={reference}>
      <DimensionContext.Provider value={dimensions}>{children}</DimensionContext.Provider>
    </div>
  );
}

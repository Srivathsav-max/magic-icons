declare module 'svg-pathdata' {
  interface SVGCommand {
    type: number;
    [key: string]: unknown;
  }

  class SVGPathDataInstance {
    constructor(path?: string);
    commands: SVGCommand[];
    toAbs(): SVGPathDataInstance;
    toString(): string;
    encode(): string;
    transform(transform: SVGPathDataTransformerFn): SVGPathDataInstance;
  }

  interface SVGPathDataConstructor {
    new (path?: string): SVGPathDataInstance;
    readonly MOVE_TO: number;
    readonly LINE_TO: number;
    readonly HORIZ_LINE_TO: number;
    readonly VERT_LINE_TO: number;
    readonly CURVE_TO: number;
    readonly SMOOTH_CURVE_TO: number;
    readonly QUAD_TO: number;
    readonly SMOOTH_QUAD_TO: number;
    readonly CLOSE_PATH: number;
    readonly ARC: number;
  }

  type SVGPathDataTransformerFn = (...args: unknown[]) => SVGPathDataInstance;

  interface SVGPathDataTransformer extends SVGPathDataTransformerFn {
    NORMALIZE_HVZ(): SVGPathDataTransformerFn;
    NORMALIZE_ST(): SVGPathDataTransformerFn;
  }

  export const SVGPathData: SVGPathDataConstructor;
  export const SVGPathDataTransformer: SVGPathDataTransformer;
  export function encodeSVGPath(commands: unknown): string;
}

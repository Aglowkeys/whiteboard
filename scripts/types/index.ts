export type CanvasEvent = MouseEvent | TouchEvent;
export type DrawingMode = 'brush' | 'rainbow-brush' | 'eraser';
export type Coordinate = {
  x: number;
  y: number;
  hue?: number;

  /**
   * Present only in touch events.
   * Indicates the pressure the user is using when drawing.
   */
  force?: number;
};
export type ContextObject = {
  main: CanvasRenderingContext2D;
  memory: CanvasRenderingContext2D;
};

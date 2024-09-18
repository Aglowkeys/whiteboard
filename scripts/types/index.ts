export type CanvasEvent = MouseEvent | TouchEvent;
export type DrawingMode = 'brush' | 'rainbow-brush' | 'eraser';
export type Coordinate = {
  x: number;
  y: number;
  hue?: number;
};
export type ContextObject = {
  main: CanvasRenderingContext2D;
  memory: CanvasRenderingContext2D;
};

import type { CanvasEvent, ContextObject, Coordinate, DrawingMode } from './types/index';
import { $, isTouchEvent, setPointerBgColor } from './utils';

export class Canvas {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private isDrawing: boolean;
  private coordinates: Array<Coordinate>;
  private size: number;
  private isTouch: boolean;
  private currentCoords: Coordinate | null;
  private memoryCanvas: HTMLCanvasElement;
  private listeners: Record<string, (() => void) | null>;
  memoryContext: CanvasRenderingContext2D;
  width: number;
  height: number;
  color: string;
  hue: number;
  backgroundColor: string;
  drawingMode: DrawingMode;

  constructor(selector: string) {
    this.canvas = $<HTMLCanvasElement>(selector);
    this.context = this.canvas.getContext('2d', { willReadFrequently: true })!;
    this.listeners = {
      mouseLeave: null,
      drawingListener: null,
    };

    this.memoryCanvas = document.createElement('canvas');
    this.memoryContext = this.memoryCanvas.getContext('2d', {
      willReadFrequently: true,
    })!;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.hue = 15;
    this.color = '#000';
    this.backgroundColor = 'white';
    this.drawingMode = 'brush';
    this.isDrawing = false;
    this.size = 5;
    this.currentCoords = null;
    this.coordinates = [];
    this.isTouch = false;

    this.setupCanvas();
  }

  private setupCanvas() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.memoryCanvas.width = this.width;
    this.memoryCanvas.height = this.height;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';

    this.fill(this.backgroundColor);

    document.body.addEventListener('mousemove', ({ x, y }) => {
      const coords: Coordinate = { x, y };

      if (this.drawingMode === 'rainbow-brush') {
        coords.hue = this.hue++;
        setPointerBgColor(`hsl(${this.hue}, 80%, 70%)`);
      }
      this.currentCoords = coords;
    });

    document.body.addEventListener('touchstart', () => {
      this.currentCoords = null;
    });

    document.body.addEventListener(
      'touchmove',
      (ev) => {
        if (ev.target === this.canvas) {
          ev.preventDefault();
        }

        const { clientX: x, clientY: y, force = 0 } = ev.touches[0];
        const coords: Coordinate = { x, y, force };

        if (this.drawingMode === 'rainbow-brush') {
          coords.hue = this.hue++;
        }

        this.currentCoords = coords;
      },
      { passive: false },
    );

    window.addEventListener('resize', () => {
      this.resize(window.innerWidth, window.innerHeight);
    });

    this.canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());
  }

  getContext(): ContextObject {
    return {
      main: this.context,
      memory: this.memoryContext,
    };
  }

  getCanvasElement() {
    return this.canvas;
  }

  setBackgroundColor(color: string) {
    this.backgroundColor = color;
  }

  setColor(color: string) {
    this.color = color;
    setPointerBgColor(color);
  }

  fill(color: string = this.color) {
    this.context.fillStyle = color;
    this.context.fillRect(0, 0, this.width, this.height);
    this.memoryContext.fillStyle = color;
    this.memoryContext.fillRect(0, 0, this.width, this.height);
    this.backgroundColor = color;
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.memoryCanvas.width = width;
    this.memoryCanvas.height = height;
    this.width = width;
    this.height = height;
  }

  changeDrawingMode(mode: DrawingMode) {
    this.drawingMode = mode;
  }

  changeSize(size: number) {
    this.size = size;
  }

  beginDrawing(ev: CanvasEvent) {
    this.isDrawing = true;
    this.isTouch = isTouchEvent(ev);

    this.listeners.drawingListener = () => {
      this.context.clearRect(0, 0, this.width, this.height);
      this.context.drawImage(this.memoryCanvas, 0, 0);

      if (this.currentCoords) {
        this.coordinates.push(this.currentCoords);
      }

      this.draw();
    };

    this.canvas.addEventListener('mousemove', this.listeners.drawingListener);
    this.canvas.addEventListener('touchmove', this.listeners.drawingListener);
  }

  stopDrawing() {
    this.isDrawing = false;
    this.coordinates = [];
    this.currentCoords = null;
    this.memoryContext.clearRect(0, 0, this.width, this.height);
    this.memoryContext.drawImage(this.canvas, 0, 0);
    const drawingListener = this.listeners.drawingListener;

    if (drawingListener) {
      this.canvas.removeEventListener('mousemove', drawingListener);
      this.canvas.removeEventListener('touchmove', drawingListener);
      this.listeners.drawingListener = null;
    }
  }

  private getDrawingColor(hue?: number) {
    return hue && this.drawingMode === 'rainbow-brush' ? `hsl(${hue}, 80%, 70%)` : this.color;
  }

  private getBrushSize({ force = 0 }: Coordinate) {
    return this.drawingMode === 'eraser' ? 1 : this.size * (1 + force);
  }

  draw() {
    if (!this.isDrawing || !this.coordinates.length) {
      return;
    }

    const length = this.coordinates.length;
    const initialCoord = this.coordinates[0];

    if (length < 3) {
      const size = this.getBrushSize(initialCoord);
      this.context.strokeStyle = this.getDrawingColor(initialCoord.hue);
      this.context.fillStyle = this.getDrawingColor(initialCoord.hue);

      this.context.beginPath();
      this.context.arc(initialCoord.x, initialCoord.y, size / 2, 0, Math.PI * 2);
      this.context.closePath();
      this.context.fill();

      this.memoryContext.clearRect(0, 0, this.width, this.height);
      this.memoryContext.drawImage(this.canvas, 0, 0);
      return;
    }

    this.context.beginPath();
    this.context.moveTo(initialCoord.x, initialCoord.y);

    for (let i = 1; i < length - 1; i++) {
      const currentCoord = this.coordinates[i];
      const nextCoord = this.coordinates[i + 1];
      const avgX = (currentCoord.x + nextCoord.x) / 2;
      const avgY = (currentCoord.y + nextCoord.y) / 2;

      this.context.lineWidth = this.getBrushSize(currentCoord);
      this.context.strokeStyle = this.getDrawingColor(currentCoord.hue);
      this.context.quadraticCurveTo(currentCoord.x, currentCoord.y, avgX, avgY);
      this.context.stroke();
      this.context.beginPath();
      this.context.moveTo(avgX, avgY);
    }

    const [secondToLastCoord, lastCoord] = this.coordinates.slice(-2);

    this.context.strokeStyle = this.getDrawingColor(secondToLastCoord.hue);
    this.context.quadraticCurveTo(secondToLastCoord.x, secondToLastCoord.y, lastCoord.x, lastCoord.y);
    this.context.stroke();
  }

  getMouseCoordinates(ev: CanvasEvent) {
    if (this.isTouch) {
      return {
        x: (ev as TouchEvent).touches[0].clientX,
        y: (ev as TouchEvent).touches[0].clientY,
      };
    }

    return {
      x: (ev as MouseEvent).clientX,
      y: (ev as MouseEvent).clientY,
    };
  }

  getCanvasAsImage() {
    return this.canvas.toDataURL('image/png');
  }

  onBeginDrawing(cb: (ev: CanvasEvent) => void) {
    this.canvas.addEventListener('mousedown', cb);
    this.canvas.addEventListener('touchstart', cb);
  }

  onStopDrawing(cb: (ev: CanvasEvent) => void) {
    this.canvas.addEventListener('mouseup', cb);
    this.canvas.addEventListener('touchend', cb);
  }
}

export type CanvasInstance = InstanceType<typeof Canvas>;

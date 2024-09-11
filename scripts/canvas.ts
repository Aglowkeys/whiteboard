import type { CanvasEvent, DrawingMode } from './types/types';
import { $, isTouchEvent } from './utils';

export class Canvas {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private pointer: HTMLElement;
  private isDrawing: boolean;
  private coordinates: Record<'x' | 'y', number>;
  private radius: number;
  private drawingEventFunction: ((e: CanvasEvent) => void) | null;
  width: number;
  height: number;
  color: string;
  backgroundColor: string;
  drawingMode: DrawingMode;

  constructor(selector: string) {
    this.canvas = $<HTMLCanvasElement>(selector);
    this.context = this.canvas.getContext('2d', { willReadFrequently: true })!;
    this.pointer = $('#pointer');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.color = '#000';
    this.backgroundColor = 'white';
    this.drawingMode = 'brush';
    this.isDrawing = false;
    this.radius = 5;
    this.coordinates = { x: 0, y: 0 };
    this.drawingEventFunction = null;

    this.setupCanvas();
  }

  private setupCanvas() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    window.addEventListener('mousemove', ({ x, y }) => {
      this.coordinates.x = x;
      this.coordinates.y = y;
      this.pointer.style.top = y + 'px';
      this.pointer.style.left = x + 'px';
    });

    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
  }

  getContext() {
    return this.context;
  }

  getCanvasElement() {
    return this.canvas;
  }

  setBackgroundColor(color: string) {
    this.backgroundColor = color;
  }

  setColor(color: string) {
    this.color = color;
  }

  fill(color: string = this.color) {
    this.context.fillStyle = color;
    this.context.fillRect(0, 0, this.width, this.height);
    this.backgroundColor = color;
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
  }

  changeDrawingMode(mode: DrawingMode) {
    this.drawingMode = mode;
  }

  changeRadius(radius: number) {
    this.radius = radius;
    this.pointer.style.width = radius + 'px';
    this.pointer.style.height = radius + 'px';
  }

  beginDrawing(ev: CanvasEvent) {
    this.isDrawing = true;
    this.drawingEventFunction = (e: CanvasEvent) => this.draw(e);
    this.canvas.addEventListener('mousemove', this.drawingEventFunction);
    this.canvas.addEventListener('touchmove', this.drawingEventFunction);
    this.reposition(ev);
  }

  stopDrawing() {
    this.isDrawing = false;

    if (this.drawingEventFunction) {
      this.canvas.removeEventListener('mousemove', this.drawingEventFunction);
      this.canvas.addEventListener('touchmove', this.drawingEventFunction);
      this.drawingEventFunction = null;
    }
  }

  draw(ev: CanvasEvent) {
    if (!this.isDrawing) {
      return;
    }

    this.context.beginPath();
    this.context.lineWidth = this.radius;
    this.context.lineCap = 'round';
    this.context.strokeStyle = this.color;
    this.context.moveTo(this.coordinates.x, this.coordinates.y);
    this.reposition(ev);
    this.context.lineTo(this.coordinates.x, this.coordinates.y);
    this.context.stroke();
  }

  reposition(ev: CanvasEvent) {
    if (ev.target === this.canvas) {
      ev.preventDefault();
    }

    const xCoord = isTouchEvent(ev) ? ev.touches[0].clientX : ev.clientX;
    const yCoord = isTouchEvent(ev) ? ev.touches[0].clientY : ev.clientY;

    this.coordinates.x = xCoord - this.canvas.offsetLeft;
    this.coordinates.y = yCoord - this.canvas.offsetTop;
  }

  getCanvasAsImage() {
    return this.canvas.toDataURL('image/png');
  }

  onBeginDrawing(cb: (ev: CanvasEvent) => void) {
    this.canvas.addEventListener('mousedown', cb);
    this.canvas.addEventListener('touchstart', cb);
  }

  onDraw(cb: (ev: CanvasEvent) => void) {
    this.canvas.addEventListener('mousemove', cb);
  }

  onStopDrawing(cb: (ev: CanvasEvent) => void) {
    this.canvas.addEventListener('mouseup', cb);
    this.canvas.addEventListener('touchend', cb);
  }
}

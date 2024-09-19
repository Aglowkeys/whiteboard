import type { CanvasInstance } from './canvas';
import { ContextObject } from './types/index';

type CanvasState = {
  canvasContext: {
    backgroundColor: string;
  };
  snapshot: ImageData;
};

export class Snapshot {
  private history: Array<CanvasState>;
  private context: ContextObject;
  private width: number;
  private height: number;
  private initialSnapshot: ImageData | null;

  constructor(canvas: CanvasInstance) {
    this.context = canvas.getContext();
    this.history = [];
    this.width = canvas.width;
    this.height = canvas.height;
    this.initialSnapshot = null;
    this.addInitialSnapshot();
  }

  private addInitialSnapshot = () => {
    const initialSnapshot = this.context.main.getImageData(0, 0, this.width, this.height);
    this.history.push({
      snapshot: initialSnapshot,
      canvasContext: { backgroundColor: 'white' },
    });
    this.initialSnapshot = initialSnapshot;
  };

  /**
   * Saves the current canvas state to the history.
   */
  addSnapshot = (bgColor: string) => {
    this.history.push({
      canvasContext: { backgroundColor: bgColor },
      snapshot: this.context.main.getImageData(0, 0, this.width, this.height),
    });
  };

  /**
   * Reverts the canvas to the previous state.
   * If successful, returns the previous state context and `true`; otherwise, returns `null` and `false`.
   *i
   * @returns {Object} - The previous state context and a flag indicating if undo was successful.
   */
  undoLastAction = () => {
    if (this.history.length > 1) {
      this.history.pop()!;
      const previousState = this.history[this.history.length - 1];
      this.context.main.putImageData(previousState.snapshot, 0, 0);
      this.context.memory.putImageData(previousState.snapshot, 0, 0);

      return {
        canvasContext: previousState.canvasContext,
        undoSuccessful: true,
      };
    }

    return {
      canvasContext: null,
      undoSuccessful: false,
    };
  };

  /**
   * Clears all saved canvas states, keeping only the initial state.
   */
  clearHistory = () => {
    this.history = this.initialSnapshot
      ? [
          {
            canvasContext: { backgroundColor: 'white' },
            snapshot: this.initialSnapshot,
          },
        ]
      : [];
  };
}

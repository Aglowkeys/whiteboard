export class Snapshot {
  private history: Array<ImageData>;
  private context: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private initialSnapshot: ImageData | null;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.context = ctx;
    this.history = [];
    this.width = width;
    this.height = height;
    this.initialSnapshot = null;
    this.addInitialSnapshot();
  }

  private addInitialSnapshot = () => {
    const initialSnapshot = this.context.getImageData(
      0,
      0,
      this.width,
      this.height,
    );
    this.history.push(initialSnapshot);
    this.initialSnapshot = initialSnapshot;
  };

  /**
   * Saves the current canvas state to the history.
   */
  addSnapshot = () => {
    this.history.push(this.context.getImageData(0, 0, this.width, this.height));
  };

  /**
   * Undoes the last canvas action by restoring the previous state.
   * Returns `true` if an undo was performed, or `false` if there
   * were no actions left to undo.
   *
   * @returns {boolean} - Whether the undo was successful.
   */
  undoLastAction = () => {
    const areThingsToUndo = this.history.length > 1;

    if (areThingsToUndo) {
      this.history.pop();
      const lastElementIdx = this.history.length - 1;
      this.context.putImageData(this.history[lastElementIdx], 0, 0);
    }

    return areThingsToUndo;
  };

  /**
   * Clears all saved canvas states, keeping only the initial state.
   */
  clearHistory = () => {
    this.history = this.initialSnapshot ? [this.initialSnapshot] : [];
  };
}

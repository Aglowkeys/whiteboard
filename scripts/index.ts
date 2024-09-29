import type { CanvasEvent } from './types/index.js';
import { Snapshot } from './history.js';
import { $, $$, getRandomColor } from './utils.js';
import { Canvas } from './canvas.js';
import { NotificationContainer } from './notification.js';
import { ConfirmDialog } from './confirm-dialog.js';
import { InfoDialog } from './info-dialog.js';

const root = $(':root');

const canvas = new Canvas('#canvas');

const pointer = $('#pointer');
const toolbar = $('#toolbar');
const toolsContainer = $('#tools-container');
const btnCollapseToolbar = $('#btn-collapse');
const btnCollapseLabel = $('#toolbar-collapse-label');
const btnBrush = $('#btn-brush');
const btnEraser = $('#btn-eraser');
const btnRainbow = $('#btn-rainbow');
const btnRoller = $('#btn-roller');
const btnUndo = $('#btn-undo');
const btnRandom = $('#btn-random');
const btnClear = $('#btn-clear');
const [inputColor, inputRange] = $$<HTMLInputElement>('input');
const brushSize = $('.brush-size');
const btnInfo = $('#btn-info');
const btnDownload = $<HTMLAnchorElement>('#btn-download');
const allButtonsInsideToolbar = toolbar.querySelectorAll<HTMLElement>('button, a, input')!;
const notificationsContainer = new NotificationContainer($('#notifications-container'));

let isDialogOpen = false;
let isDrawing = false;
const collapseButtonHeight = `${btnCollapseToolbar.scrollHeight}px`;
const toolbarHeight = `${toolbar.scrollHeight}px`;
toolbar.style.height = toolbarHeight;

const { addSnapshot, undoLastAction, clearHistory } = new Snapshot(canvas);

const undoAndSetCanvasColor = () => {
  const { canvasContext, undoSuccessful } = undoLastAction();

  if (!undoSuccessful || !canvasContext) {
    return;
  }

  canvas.setBackgroundColor(canvasContext.backgroundColor);

  if (canvas.drawingMode === 'eraser') {
    canvas.setColor(canvasContext.backgroundColor);
  }
};

const stopDrawing = () => {
  isDrawing = false;
  canvas.stopDrawing();

  toolbar.classList.remove('is-drawing');
  allButtonsInsideToolbar.forEach((el) => el.removeAttribute('tabindex'));

  // We return focus to the last selected tool after drawing
  current.focus();

  addSnapshot(canvas.backgroundColor);
};

const fillCanvasOrBeginDrawing = (ev: CanvasEvent) => {
  if (current === btnRoller) {
    canvas.fill();
  } else {
    isDrawing = true;
    toolbar.classList.add('is-drawing');

    // To prevent pressing tab and changing tools while drawing
    allButtonsInsideToolbar.forEach((el) => el.setAttribute('tabindex', '-1'));

    canvas.beginDrawing(ev);
  }
};

canvas.onBeginDrawing(fillCanvasOrBeginDrawing);
canvas.onStopDrawing(stopDrawing);

let current = btnBrush; // nuestra herramienta activa
btnBrush.classList.add('active');

const updateCurrent = (elem: HTMLElement) => {
  current.classList.remove('active');
  current = elem;
  current.classList.add('active');
  current.focus();
};

// Minimizar barra de herramientas
btnCollapseToolbar.addEventListener('click', () => {
  const isCollapsed = toolbar.classList.toggle('toolbar--collapsed');
  toolbar.style.height = isCollapsed ? collapseButtonHeight : toolbarHeight;

  btnCollapseLabel.textContent = `${isCollapsed ? 'Expandir' : 'Contraer'} barra de herramientas`;
  toolsContainer.setAttribute('aria-expanded', `${!isCollapsed}`);
  toolbar.style.overflow = 'hidden';
  toolsContainer.style.visibility = 'visible';

  toolbar.addEventListener('transitionend', (ev) => {
    if (ev.propertyName.toLowerCase() !== 'height') {
      return;
    }

    toolsContainer.style.visibility = isCollapsed ? 'hidden' : 'visible';
    toolbar.style.overflow = 'visible';
  });
});

// Pincel
const selectBrushTool = () => {
  updateCurrent(btnBrush);
  canvas.changeDrawingMode('brush');
  canvas.setColor(inputColor.value || 'black');
};
btnBrush.addEventListener('click', selectBrushTool);

// Borrador
const selectEraserTool = () => {
  updateCurrent(btnEraser);
  canvas.changeDrawingMode('eraser');
  canvas.setColor(canvas.backgroundColor);
};
btnEraser.addEventListener('click', selectEraserTool);

// Arcoíris
const selectRainbowTool = () => {
  updateCurrent(btnRainbow);
  canvas.changeDrawingMode('rainbow-brush');
};
btnRainbow.addEventListener('click', selectRainbowTool);

// Rodillo
const selectRollerTool = () => {
  canvas.changeDrawingMode('brush');
  canvas.setColor(inputColor.value || 'black');
  updateCurrent(btnRoller);
};
btnRoller.addEventListener('click', selectRollerTool);

// Deshacer acción
btnUndo.addEventListener('click', () => {
  undoAndSetCanvasColor();
});

// Color random
const selectRandomColorTool = () => {
  const randomColor = getRandomColor();
  inputColor.value = randomColor;
  root.style.setProperty('--current-color', randomColor);

  if (canvas.drawingMode === 'brush') {
    canvas.setColor(randomColor);
  }

  btnRandom.focus();
};
btnRandom.addEventListener('click', selectRandomColorTool);

// Selector de color
inputColor.addEventListener('change', () => {
  canvas.setColor(inputColor.value);
  root.style.setProperty('--current-color', inputColor.value);
});

// Tamaño pincel
inputRange.addEventListener('input', () => {
  const size = Number(inputRange.value);
  canvas.changeSize(size);
  pointer.style.width = `${size}px`;
  pointer.style.height = `${size}px`;
  brushSize.innerText = `${size} px`;
});

const showConfirmDialog = () => {
  isDialogOpen = true;
  confirmDialog.show();
};

const hideConfirmDialog = () => (isDialogOpen = false);

const clearBoard = () => {
  isDialogOpen = false;
  canvas.fill('white');
  if (canvas.drawingMode === 'eraser') {
    canvas.setColor(canvas.backgroundColor);
  }
  clearHistory();
};

const confirmDialog = new ConfirmDialog(clearBoard, hideConfirmDialog);
btnClear.addEventListener('click', showConfirmDialog);

const openModal = () => {
  isDialogOpen = true;
  infoDialog.show();
};
const closeModal = () => (isDialogOpen = false);
const infoDialog = new InfoDialog(closeModal);
btnInfo.addEventListener('click', openModal);

//
// ========== DESCARGAR IMAGEN ==========
//
btnDownload.addEventListener('click', () => {
  btnDownload.href = canvas.getCanvasAsImage();
  notificationsContainer.addNotification();
});

//
// ========== SELECCIÓN CON TECLADO ==========
//
const selectColorTool = () => {
  inputColor.focus();
  inputColor.click();
};
const selectSizeTool = () => inputRange.focus();
const selectDownloadTool = () => {
  btnDownload.focus();
  btnDownload.click();
};

const keyMaps = {
  '1': selectBrushTool,
  '2': selectEraserTool,
  '3': selectRainbowTool,
  '4': selectRollerTool,
  '5': selectRandomColorTool,
  '6': selectColorTool,
  '7': selectSizeTool,
  '8': showConfirmDialog,
  '9': selectDownloadTool,
  '0': openModal,
} as const;

type KeyMapKeys = keyof typeof keyMaps;

let isClickPressed = false;

window.addEventListener('mousedown', () => (isClickPressed = true));
window.addEventListener('mouseup', () => (isClickPressed = false));
window.addEventListener('keydown', (ev) => {
  if (isDialogOpen || isClickPressed) {
    return;
  }

  const metaKeyPressed = ev.ctrlKey || ev.metaKey;

  if (ev.key === 'z' && metaKeyPressed) {
    return undoAndSetCanvasColor();
  }

  const isValidKey = (key: string): key is KeyMapKeys => key in keyMaps;

  if (!metaKeyPressed && isValidKey(ev.key)) {
    return keyMaps[ev.key]();
  }
});

window.addEventListener('mousemove', ({ x, y }) => {
  pointer.style.top = y + 'px';
  pointer.style.left = x + 'px';
});

document.body.addEventListener('mouseleave', () => {
  if (isDrawing) {
    stopDrawing();
  }
});

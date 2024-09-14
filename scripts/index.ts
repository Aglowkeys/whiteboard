import type { CanvasEvent } from './types/types.js';
import { Snapshot } from './history.js';
import { $, $$, getRandomColor } from './utils.js';
import { Canvas } from './canvas.js';
import { NotificationContainer } from './notification.js';

const root = $(':root');

const canvas = new Canvas('#canvas');

const toolbar = $('#toolbar');
const toolsContainer = $('#tools-container');
const btnCollapseToolbar = $('#btn-collapse');
const btnBrush = $('#btn-brush');
const btnEraser = $('#btn-eraser');
const btnRainbow = $('#btn-rainbow');
const btnRoller = $('#btn-roller');
const btnUndo = $('#btn-undo');
const btnRandom = $('#btn-random');
const btnClear = $('#btn-clear');
const [inputColor, inputRange] = $$<HTMLInputElement>('input');
const brushSize = $('.brush-size');
const confirmOverlay = $('#confirm-overlay');
const confirmDialog = $('#confirm');
const [clearBoardButton, cancelClearBoardButton] =
  confirmDialog.querySelectorAll('button');
const [confirmTopTrap, confirmBottomTrap] = confirmDialog.querySelectorAll(
  '[id^=confirm-focus-trap]',
);
const btnInfo = $('#btn-info');
const btnClose = $('#btn-close');
const overlay = $('#modal-overlay');
const modal = $('#modal');
const btnDownload = $<HTMLAnchorElement>('#btn-download');
const notificationsContainer = new NotificationContainer(
  $('#notifications-container'),
);

let hue = 15; // para el input rainbow
let rainbowColor = `hsl(${hue}, 80%, 70%)`;
let isDialogOpen = false;

const { addSnapshot, undoLastAction, clearHistory } = new Snapshot(
  canvas.getContext(),
  canvas.width,
  canvas.height,
);

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

const draw = (ev: CanvasEvent) => {
  const { drawingMode } = canvas;

  canvas.draw(ev);

  if (drawingMode === 'rainbow-brush') {
    hue += 1;
    rainbowColor = `hsl(${hue}, 80%, 70%)`;
    canvas.setColor(rainbowColor);
  }
};

const beginDrawing = (ev: CanvasEvent) => {
  canvas.beginDrawing(ev);
};

const stopDrawing = () => {
  canvas.stopDrawing();
  addSnapshot(canvas.backgroundColor);
};

const fillCanvasOrBeginDrawing = (ev: CanvasEvent) => {
  if (current === btnRoller) {
    canvas.fill();
  } else {
    beginDrawing(ev);
  }
};

canvas.onBeginDrawing(fillCanvasOrBeginDrawing);
canvas.onDraw(draw);
canvas.onStopDrawing(stopDrawing);

let current = btnBrush; // nuestra herramienta activa
btnBrush.classList.add('active');

const updateCurrent = (elem: HTMLElement) => {
  current.classList.remove('active');
  current = elem;
  current.classList.add('active');
};

// Minimizar barra de herramientas
btnCollapseToolbar.addEventListener('click', () => {
  const TOOLS_CONTAINER_COLLAPSED_CLASS = 'tools-container--collapsed';

  toolsContainer.classList.toggle(TOOLS_CONTAINER_COLLAPSED_CLASS);
  btnCollapseToolbar.classList.toggle('btn-collapse--collapsed');

  const isCollapsed = toolsContainer.className.includes(
    TOOLS_CONTAINER_COLLAPSED_CLASS,
  );

  btnCollapseToolbar.setAttribute(
    'aria-label',
    `${isCollapsed ? 'Expandir' : 'Contraer'} barra de herramientas`,
  );
  toolsContainer.setAttribute('aria-expanded', `${!isCollapsed}`);
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
  canvas.setColor(rainbowColor);
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
  const radius = Number(inputRange.value);
  canvas.changeRadius(radius);
  brushSize.innerText = `${radius} px`;
});

confirmTopTrap.addEventListener('focus', () => cancelClearBoardButton.focus());
confirmBottomTrap.addEventListener('focus', () => clearBoardButton.focus());

const showConfirmDialog = () => {
  isDialogOpen = true;
  toolbar.setAttribute('inert', 'true');
  confirmOverlay.classList.add('visible');
  confirmDialog.classList.add('visible');
  clearBoardButton.focus();
  confirmOverlay.addEventListener('keydown', hideConfirmDialogOnEsc);
};

const hideConfirmDialog = () => {
  isDialogOpen = false;
  toolbar.removeAttribute('inert');
  confirmOverlay.classList.remove('visible');
  confirmDialog.classList.remove('visible');

  // Restore focus to the button that opened the confirm dialog
  btnClear.focus();
  confirmOverlay.removeEventListener('keydown', hideConfirmDialogOnEsc);
};

const hideConfirmDialogOnEsc = (ev: KeyboardEvent) => {
  if (ev.key === 'Escape') {
    hideConfirmDialog();
  }
};

const clearBoard = () => {
  canvas.fill('white');
  if (canvas.drawingMode === 'eraser') {
    canvas.setColor(canvas.backgroundColor);
  }
  hideConfirmDialog();
  clearHistory();
};

btnClear.addEventListener('click', showConfirmDialog);
clearBoardButton.addEventListener('click', clearBoard);
cancelClearBoardButton.addEventListener('click', hideConfirmDialog);

/* Managing Focus Trap inside the modal */
const [topFocusTrap, bottomFocusTrap] = modal.querySelectorAll(
  '[id^=modal-focus-trap]',
);
const allFocusableElements = modal.querySelectorAll(
  'button, a',
) as NodeListOf<HTMLElement>;
const firstFocusableElement = allFocusableElements[0];
const lastFocusableElement =
  allFocusableElements[allFocusableElements.length - 1];

const goToFirstFocusableElement = () => firstFocusableElement.focus();
const goToLastFocusableElement = () => lastFocusableElement.focus();

topFocusTrap.addEventListener('focus', goToLastFocusableElement);
bottomFocusTrap.addEventListener('focus', goToFirstFocusableElement);

const openModal = () => {
  isDialogOpen = true;
  toolbar.setAttribute('inert', 'true');
  overlay.classList.add('visible');
  modal.classList.add('visible');

  window.addEventListener('keydown', closeModalOnEsc);

  firstFocusableElement.focus();
};

const closeModal = () => {
  isDialogOpen = false;
  toolbar.removeAttribute('inert');
  overlay.classList.remove('visible');
  modal.classList.remove('visible');

  window.removeEventListener('keydown', closeModalOnEsc);

  // Restore focus to the button that opened the modal
  btnInfo.focus();
};

btnInfo.addEventListener('click', openModal);

btnClose.addEventListener('click', closeModal);

overlay.addEventListener('click', (ev) => {
  if (ev.target === overlay) {
    closeModal();
  }
});

const closeModalOnEsc = (ev: KeyboardEvent) => {
  if (ev.key === 'Escape') {
    closeModal();
  }
};

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

window.addEventListener('keydown', (ev) => {
  if (isDialogOpen) {
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

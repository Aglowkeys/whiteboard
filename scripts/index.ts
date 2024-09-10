import type { CanvasEvent } from './types/types.js';
import { Snapshot } from './history.js';

const $ = <T extends Element = HTMLElement>(selector: string): T =>
  document.querySelector(selector)!;
const $$ = <T extends Element = HTMLElement>(selector: string): NodeListOf<T> =>
  document.querySelectorAll(selector);

const canvas = $<HTMLCanvasElement>('#canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
const pointer = $('#pointer');
const root = $(':root');

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
const notification = $('#notification');

// CANVAS SETUP
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const coords = {
  x: 0,
  y: 0,
};

let radius = 5; // para el input range y el puntero
let color = '#000'; // para el selector de color
let canvasColor = 'white'; // para cuando borramos y usamos el rodillo
let hue = 15; // para el input rainbow
let isRainbow = false;
let isErasing = false;
let rainbowColor = `hsl(${hue}, 80%, 70%)`;
const { addSnapshot, undoLastAction, clearHistory } = new Snapshot(
  ctx,
  canvas.width,
  canvas.height,
);

const undoAndSetCanvasColor = () => {
  const { canvasContext, undoSuccessful } = undoLastAction();
  if (undoSuccessful) {
    canvasColor = canvasContext!.backgroundColor;
  }
};

const isTouchEvent = (ev: Event): ev is TouchEvent =>
  ev.type.toLowerCase().startsWith('touch');

const reposition = (ev: CanvasEvent) => {
  if (ev.target === canvas) {
    ev.preventDefault();
  }

  const xCoord = isTouchEvent(ev) ? ev.touches[0].clientX : ev.clientX;
  const yCoord = isTouchEvent(ev) ? ev.touches[0].clientY : ev.clientY;

  coords.x = xCoord - canvas.offsetLeft;
  coords.y = yCoord - canvas.offsetTop;
};

const draw = (ev: CanvasEvent) => {
  if (isErasing) color = canvasColor;

  ctx.beginPath();
  ctx.lineWidth = radius;
  ctx.lineCap = 'round';
  ctx.strokeStyle = isRainbow ? rainbowColor : color;
  ctx.moveTo(coords.x, coords.y);
  reposition(ev);
  ctx.lineTo(coords.x, coords.y);
  ctx.stroke();

  if (isRainbow) {
    hue += 1;
    rainbowColor = `hsl(${hue}, 80%, 70%)`;
  }
};

const fillCanvas = (color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  canvasColor = color;
};

const beginDrawing = (ev: CanvasEvent) => {
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('touchmove', draw);
  reposition(ev);
};

const stopDrawing = () => {
  canvas.removeEventListener('mousemove', draw);
  canvas.addEventListener('touchmove', draw);
  addSnapshot(canvasColor);
};

const fillCanvasOrBeginDrawing = (ev: CanvasEvent) => {
  if (current === btnRoller) {
    fillCanvas(color);
  } else {
    beginDrawing(ev);
  }
};

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

canvas.addEventListener('mousedown', fillCanvasOrBeginDrawing);
canvas.addEventListener('touchstart', fillCanvasOrBeginDrawing);

canvas.addEventListener('click', draw);

canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('touchend', stopDrawing);

// Puntero
window.addEventListener('mousemove', (ev) => {
  coords.x = ev.x;
  coords.y = ev.y;
  pointer.style.top = ev.y + 'px';
  pointer.style.left = ev.x + 'px';
});

window.addEventListener('keydown', (ev) => {
  if (ev.key === 'z' && (ev.ctrlKey || ev.metaKey)) {
    undoAndSetCanvasColor();
  }
});

const getRandomColor = () => {
  // No puede ser en hsl porque uso este valor para
  // reflejar el cambio también en el input type="color"
  // y solo acepta values que sean hexadecimales.
  color = '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0');
};

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
  isRainbow = false;
  isErasing = false;
  color = inputColor.value || 'black';
};
btnBrush.addEventListener('click', selectBrushTool);

// Borrador
const selectEraserTool = () => {
  updateCurrent(btnEraser);
  isRainbow = false;
  isErasing = true;
};
btnEraser.addEventListener('click', selectEraserTool);

// Arcoíris
const selectRainbowTool = () => {
  updateCurrent(btnRainbow);
  isRainbow = true;
  isErasing = false;
};
btnRainbow.addEventListener('click', selectRainbowTool);

// Rodillo
const selectRollerTool = () => {
  isRainbow = false;
  isErasing = false;
  color = inputColor.value || 'black';
  updateCurrent(btnRoller);
};
btnRoller.addEventListener('click', selectRollerTool);

// Deshacer acción
btnUndo.addEventListener('click', () => {
  undoAndSetCanvasColor();
});

// Color random
const selectRandomColorTool = () => {
  getRandomColor();
  inputColor.value = color;
  root.style.setProperty('--current-color', color);
  btnRandom.focus();
};
btnRandom.addEventListener('click', selectRandomColorTool);

// Selector de color
inputColor.addEventListener('change', () => {
  color = inputColor.value;
  root.style.setProperty('--current-color', inputColor.value);
});

// Tamaño pincel
inputRange.addEventListener('input', () => {
  radius = Number(inputRange.value);
  brushSize.innerText = `${radius} px`;
  const size = radius + 'px';
  pointer.style.width = size;
  pointer.style.height = size;
});

confirmTopTrap.addEventListener('focus', () => cancelClearBoardButton.focus());
confirmBottomTrap.addEventListener('focus', () => clearBoardButton.focus());

const showConfirmDialog = () => {
  confirmOverlay.classList.add('visible');
  confirmDialog.classList.add('visible');
  clearBoardButton.focus();
  confirmOverlay.addEventListener('keydown', hideConfirmDialogOnEsc);
};

const hideConfirmDialog = () => {
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
  fillCanvas('white');
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
  overlay.classList.add('visible');
  modal.classList.add('visible');

  window.addEventListener('keydown', closeModalOnEsc);

  firstFocusableElement.focus();
};

const closeModal = () => {
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
  btnDownload.href = canvas.toDataURL('image/png');
  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
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
  1: selectBrushTool,
  2: selectEraserTool,
  3: selectRainbowTool,
  4: selectRollerTool,
  5: selectRandomColorTool,
  6: selectColorTool,
  7: selectSizeTool,
  8: showConfirmDialog,
  9: selectDownloadTool,
  0: openModal,
};

window.addEventListener('keydown', (ev) => {
  const toolFunctionToCall = keyMaps[ev.key as unknown as keyof typeof keyMaps];
  if (toolFunctionToCall) toolFunctionToCall();
});

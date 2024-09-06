const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const pointer = document.getElementById('pointer');
const root = document.querySelector(':root');
const [
  btnBrush,
  btnEraser,
  btnRainbow,
  btnRoller,
  btnUndo,
  btnRandom,
  btnClear,
] = document.querySelectorAll('button');
const [inputColor, inputRange] = document.querySelectorAll('input');
const brushSize = document.querySelector('.brush-size');
const confirmOverlay = document.getElementById('confirm-overlay');
const confirmDialog = document.getElementById('confirm');
const [clearBoardButton, cancelClearBoardButton] =
  confirmDialog.querySelectorAll('button');
const [confirmTopTrap, confirmBottomTrap] = confirmDialog.querySelectorAll(
  '[id^=confirm-focus-trap]',
);
const btnInfo = document.getElementById('btn-info');
const btnClose = document.getElementById('btn-close');
const overlay = document.getElementById('modal-overlay');
const modal = document.getElementById('modal');
const btnDownload = document.getElementById('btn-download');
const notification = document.getElementById('notification');

// CANVAS SETUP
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const coords = {
  x: null,
  y: null,
};

let radius = 5; // para el input range y el puntero
let color = '#000'; // para el selector de color
let canvasColor = 'white'; // para cuando borramos y usamos el rodillo
let hue = 15; // para el input rainbow
let isRainbow = false;
let isErasing = false;
let rainbowColor = `hsl(${hue}, 80%, 70%)`;

let undoSnapshots = [];

const addSnapshotToUndoHistory = () => {
  undoSnapshots.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
};

const undoLastAction = () => {
  undoSnapshots.pop();

  if (undoSnapshots.length > 0) {
    const lastElementIdx = undoSnapshots.length - 1;
    ctx.putImageData(undoSnapshots[lastElementIdx], 0, 0);
  } else {
    fillCanvas('white');
  }
};

const reposition = (ev) => {
  if (ev.target === canvas) {
    ev.preventDefault();
  }

  const xCoord = ev.type === 'touchmove' ? ev.touches[0].clientX : ev.clientX;
  const yCoord = ev.type === 'touchmove' ? ev.touches[0].clientY : ev.clientY;

  coords.x = xCoord - canvas.offsetLeft;
  coords.y = yCoord - canvas.offsetTop;
};

const draw = (ev) => {
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

const fillCanvas = (color) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  canvasColor = color;
};

const beginDrawing = (ev) => {
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('touchmove', draw);
  reposition(ev);
};

const stopDrawing = () => {
  canvas.removeEventListener('mousemove', draw);
  canvas.addEventListener('touchmove', draw);
  addSnapshotToUndoHistory();
};

const fillCanvasOrBeginDrawing = (ev) => {
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
    undoLastAction();
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

const updateCurrent = (elem) => {
  current.classList.remove('active');
  current = elem;
  current.classList.add('active');
};

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
  undoLastAction();
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
inputColor.addEventListener('change', (ev) => {
  color = ev.target.value;
  root.style.setProperty('--current-color', ev.target.value);
});

// Tamaño pincel
inputRange.addEventListener('input', (ev) => {
  radius = ev.target.value;
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

const hideConfirmDialogOnEsc = (ev) => {
  if (ev.key === 'Escape') {
    hideConfirmDialog();
  }
};

const clearBoard = () => {
  fillCanvas('white');
  hideConfirmDialog();
  undoSnapshots = [];
};

btnClear.addEventListener('click', showConfirmDialog);
clearBoardButton.addEventListener('click', clearBoard);
cancelClearBoardButton.addEventListener('click', hideConfirmDialog);

/* Managing Focus Trap inside the modal */
const [topFocusTrap, bottomFocusTrap] = modal.querySelectorAll(
  '[id^=modal-focus-trap]',
);
const allFocusableElements = modal.querySelectorAll('button, a');
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

const closeModalOnEsc = (ev) => {
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
  const toolFunctionToCall = keyMaps[ev.key];
  toolFunctionToCall && toolFunctionToCall();
});

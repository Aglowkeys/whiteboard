const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});

const coords = {
	x: null,
	y: null,
};

const reposition = (ev) => {
	coords.x = ev.x - canvas.offsetLeft;
	coords.y = ev.y - canvas.offsetTop;
};

const draw = (ev) => {
	if (isErasing) color = 'white';
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
};

const beginDrawing = (ev) => {
	canvas.addEventListener('mousemove', draw);
	reposition(ev);
};

const stopDrawing = () => {
	canvas.removeEventListener('mousemove', draw);
};

canvas.addEventListener('mousedown', (ev) => {
	if (current === btnBucket) {
		fillCanvas(color);
	} else {
		beginDrawing(ev);
	}
});
canvas.addEventListener('mouseup', stopDrawing);

let radius = 5; // para el input range
let color = '#000'; // para el selector de color
let hue = 15; // para el input rainbow
let isRainbow = false;
let isErasing = false;
let rainbowColor = `hsl(${hue}, 80%, 70%)`;

const getRandomColor = () => {
	// No puede ser en hsl porque uso este valor para
	// reflejar el cambio también en el input type="color"
	// y solo acepta values que sean hexadecimales.
	color = '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0');
};

const updateCurrent = (elem) => {
	current.classList.remove('active');
	current = elem;
	current.classList.add('active');
};

//
// ========== DOM TOOLS ==========
//
const root = document.querySelector(':root');
const [btnBrush, btnEraser, btnRainbow, btnRandom, btnBucket, btnSquare, btnCircle, btnClear] =
	document.querySelectorAll('button');
const [inputColor, inputRange] = document.querySelectorAll('input');
const brushSize = document.querySelector('.brush-size');

let current = btnBrush; // nuestra herramienta activa
btnBrush.classList.add('active');

// Pincel
btnBrush.addEventListener('click', () => {
	updateCurrent(btnBrush);
	isRainbow = false;
	isErasing = false;
	color = inputColor.value || 'black';
});

// Borrador
btnEraser.addEventListener('click', () => {
	updateCurrent(btnEraser);
	isRainbow = false;
	isErasing = true;
	color = 'white';
});

// Selector de color
inputColor.addEventListener('change', (ev) => {
	color = ev.target.value;
	root.style.setProperty('--current-color', ev.target.value);
});

// Arcoiris
btnRainbow.addEventListener('click', () => {
	updateCurrent(btnRainbow);
	isRainbow = true;
	isErasing = false;
});

// Color random
btnRandom.addEventListener('click', () => {
	getRandomColor();
	inputColor.value = color;
	root.style.setProperty('--current-color', color);
});

// Balde
btnBucket.addEventListener('click', () => {
	isRainbow = false;
	isErasing = false;
	color = inputColor.value || 'black';
	updateCurrent(btnBucket);
});

// Tamaño pincel
inputRange.addEventListener('input', (ev) => {
	brushSize.innerText = ev.target.value * 2 + 'px';
	radius = ev.target.value;
});

// Limpiar pizarra
btnClear.addEventListener('click', () => fillCanvas('white'));

//
// ========== MODAL ==========
//
const btnInfo = document.getElementById('btn-info');
const btnClose = document.getElementById('btn-close');
const overlay = document.getElementById('modal-overlay');
const modal = document.getElementById('modal');

btnInfo.addEventListener('click', () => {
	overlay.classList.add('visible');
	modal.classList.add('visible');
});

btnClose.addEventListener('click', () => {
	overlay.classList.remove('visible');
	modal.classList.remove('visible');
});

overlay.addEventListener('click', (ev) => {
	if (ev.target === overlay) {
		overlay.classList.remove('visible');
		modal.classList.remove('visible');
	}
});

window.addEventListener('keydown', (ev) => {
	if (ev.key === 'Escape') {
		overlay.classList.remove('visible');
		modal.classList.remove('visible');
	}
});

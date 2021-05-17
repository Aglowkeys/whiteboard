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

let radius = 5; // para el input range
let color = '#000'; // para el selector de color
let hue = 15; // para el input rainbow
let rainbowColor = `hsl(${hue}, 80%, 70%)`;

const drawCircle = () => {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(coords.x, coords.y, radius, 0, Math.PI * 2);
	ctx.fill();
};

const getRandomColor = () => {
	// No puede ser en hsl porque uso este valor para
	// reflejar el cambio también en el input type="color"
	// y solo acepta values que sean hexadecimales.
	color = '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0');
};

window.addEventListener('mousedown', (ev) => {
	coords.x = ev.x;
	coords.y = ev.y;
	drawCircle();
});

/* 
	=== DOM TOOLS ===
*/

const [btnBrush, btnEraser, btnRainbow, btnRandom, btnClear] = document.querySelectorAll('button');
const [inputColor, inputRange] = document.querySelectorAll('input');
const brushSize = document.querySelector('.brush-size');

// Pincel

// Borrador
btnEraser.addEventListener('click', () => {});

// Selector de color
inputColor.addEventListener('change', (ev) => {
	color = ev.target.value;
});

// Arcoiris

// Color random
btnRandom.addEventListener('click', () => {
	getRandomColor();
	inputColor.value = color;
});

// Tamaño pincel
inputRange.addEventListener('input', (ev) => {
	brushSize.innerText = ev.target.value * 2 + 'px';
	radius = ev.target.value;
});

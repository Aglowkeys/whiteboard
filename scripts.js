const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const coords = {
	x: null,
	y: null,
};

const reposition = (ev) => {
	coords.x = ev.x - canvas.offsetLeft;
	coords.y = ev.y - canvas.offsetTop;
};

const draw = (ev) => {
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

const beginDrawing = (ev) => {
	window.addEventListener('mousemove', draw);
	reposition(ev);
};

const stopDrawing = () => {
	window.removeEventListener('mousemove', draw);
};

window.addEventListener('mousedown', beginDrawing);
window.addEventListener('mouseup', stopDrawing);

window.addEventListener('resize', () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});

let radius = 5; // para el input range
let color = '#000'; // para el selector de color
let hue = 15; // para el input rainbow
let isRainbow = false;
let rainbowColor = `hsl(${hue}, 80%, 70%)`;

// const drawCircle = () => {
// 	ctx.fillStyle = color;
// 	ctx.beginPath();
// 	ctx.arc(coords.x, coords.y, radius, 0, Math.PI * 2);
// 	ctx.fill();
// };

// window.addEventListener('mousedown', (ev) => {
// 	coords.x = ev.x;
// 	coords.y = ev.y;
// 	drawCircle();
// });

const getRandomColor = () => {
	// No puede ser en hsl porque uso este valor para
	// reflejar el cambio también en el input type="color"
	// y solo acepta values que sean hexadecimales.
	color = '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0');
};

/* 
	=== DOM TOOLS ===
*/

const [btnBrush, btnEraser, btnRainbow, btnRandom, btnClear] = document.querySelectorAll('button');
const [inputColor, inputRange] = document.querySelectorAll('input');
const brushSize = document.querySelector('.brush-size');

// Pincel
btnBrush.addEventListener('mousedown', (ev) => {
	isRainbow = false;
	color = inputColor.value || 'black';
});

// Borrador
btnEraser.addEventListener('click', () => {
	isRainbow = false;
	color = 'white';
});

// Selector de color
inputColor.addEventListener('change', (ev) => {
	color = ev.target.value;
});

// Arcoiris
btnRainbow.addEventListener('click', () => {
	isRainbow = true;
});

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

// Limpiar pizarra
btnClear.addEventListener('click', () => {
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
});

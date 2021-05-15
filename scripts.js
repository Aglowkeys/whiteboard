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

const radius = 30;
const hue = 15;

const drawCircle = () => {
	ctx.fillStyle = getRandomColor();
	ctx.beginPath();
	ctx.arc(coords.x, coords.y, radius, 0, Math.PI * 2);
	ctx.fill();
};

const getRandomColor = () => {
	const h = Math.floor(Math.random() * 360);
	const s = Math.floor(Math.random() * 100);
	const l = Math.floor(Math.random() * 100);

	return `hsl(${h}, ${s}%, ${l}%)`;
};

window.addEventListener('click', (ev) => {
	coords.x = ev.x;
	coords.y = ev.y;
	drawCircle();
});

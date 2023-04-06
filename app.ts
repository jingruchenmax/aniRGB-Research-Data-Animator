// app.ts

interface DataPoint {
	frameNumber: number;
	time: string;
	locationX: number;
	locationY: number;
	rotation: number;
	inputX: number;
	inputY: number;
}

// DOM elements
const numImgInput = document.getElementById("numImg") as HTMLInputElement;
const F0Input = document.getElementById("F0") as HTMLInputElement;
const FfInput = document.getElementById("Ff") as HTMLInputElement;
const mapXInput = document.getElementById("mapX") as HTMLInputElement;
const mapYInput = document.getElementById("mapY") as HTMLInputElement;
const csvFileInput = document.getElementById("csvFile") as HTMLInputElement;
const svgFileInput = document.getElementById("svgFile") as HTMLInputElement;
const generateButton = document.getElementById("generate") as HTMLButtonElement;
const canvas = document.getElementById("aniRGB-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

// Function to parse CSV data
const parseCSV = (csv: string): DataPoint[] => {
	const lines = csv.split("\n");
	const dataPoints: DataPoint[] = [];

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (line) {
			const [frameNumber, time, locationX, locationY, rotation, inputX, inputY] = line.split(",").map((value, index) => {
				return index === 1 ? value : parseFloat(value);
			});

			dataPoints.push({ frameNumber, time, locationX, locationY, rotation, inputX, inputY } as DataPoint);
		}
	}

	return dataPoints;
};

// Function to draw the background image
const drawBackground = async (url: string) => {
	const img = new Image();
	img.src = url;

	return new Promise((resolve) => {
		img.onload = () => {
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			resolve(null);
		};
	});
};

// Function to draw the player locations
const drawPlayerLocations = (dataPoints: DataPoint[], numImg: number, F0: number, Ff: number, mapX: number, mapY: number) => {
	const frameNums = Array.from({ length: numImg }, (_, i) => F0 + i * Math.floor((Ff - F0) / numImg));

	for (const frameNum of frameNums) {
		const dataPoint = dataPoints.find((point) => point.frameNumber === frameNum);

		if (dataPoint) {
			const hue = (frameNum - F0) / (Ff - F0) * 255;
			ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.5)`;

			const x = (dataPoint.locationX / mapX) * canvas.width;
			const y = (dataPoint.locationY / mapY) * canvas.height;

			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x + 10 * Math.cos(dataPoint.rotation), y + 10 * Math.sin(dataPoint.rotation));
			ctx.lineTo(x + 10 * Math.cos(dataPoint.rotation + 2 * Math.PI / 3), y + 10 * Math.sin(dataPoint.rotation + 2 * Math.PI / 3));
			ctx.closePath();
			ctx.fill();
		}
	}
};

// Event listeners
generateButton.addEventListener("click", async () => {
	const numImg = parseInt(numImgInput.value);
	const F0 = parseInt(F0Input.value);
	const Ff = parseInt(FfInput.value);
	const mapX = parseInt(mapXInput.value);
	const mapY = parseInt(mapYInput.value);
	const csvFile = csvFileInput.files && csvFileInput.files[0];
	const svgFile = svgFileInput.files && svgFileInput.files[0];

	if (csvFile && svgFile) {
		const csvData = await csvFile.text();
		const dataPoints = parseCSV(csvData);

		await drawBackground(URL.createObjectURL(svgFile));
		drawPlayerLocations(dataPoints, numImg, F0, Ff, mapX, mapY);
	}
});

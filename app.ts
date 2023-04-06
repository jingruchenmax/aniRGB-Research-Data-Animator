// app.ts

interface DataPoint {
	frameNumber: number;
	locationX: number;
	locationY: number;
	rotation: number;
}

// DOM elements
console.log("Creating DOM elements");
const numImgInput = document.getElementById("numImg") as HTMLInputElement;
const F0Input = document.getElementById("F0") as HTMLInputElement;
const FfInput = document.getElementById("Ff") as HTMLInputElement;
const mapX0Input = document.getElementById("mapX0") as HTMLInputElement;
const mapXfInput = document.getElementById("mapXf") as HTMLInputElement;
const mapY0Input = document.getElementById("mapY0") as HTMLInputElement;
const mapYfInput = document.getElementById("mapYf") as HTMLInputElement;
const csvFileInput = document.getElementById("csvFile") as HTMLInputElement;
const svgFileInput = document.getElementById("svgFile") as HTMLInputElement;
const generateButton = document.getElementById("generate") as HTMLButtonElement;
const canvas = document.getElementById("aniRGB-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

// Function to fetch and parse CSV data
const fetchAndParseCSV = async (url: string): Promise<DataPoint[]> => {
	const response = await fetch(url);
	const csv = await response.text();
	return parseCSV(csv);
};

// Function to parse CSV data
const parseCSV = (csv: string): DataPoint[] => {
	const lines = csv.split("\n");
	const dataPoints: DataPoint[] = [];

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (line) {
			const [frameNumber, locationX, locationY, rotation] = line.split(",").map((value, index) => {
				console.log(`value: ${value}, index: ${index}`);
				return index === 1 ? value : parseFloat(value);
			});

			dataPoints.push({frameNumber, locationX, locationY, rotation} as DataPoint);
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
			console.log('draw background');
			resolve(null);
		};
	});
};

// Function to draw the player locations
const drawPlayerLocations = (dataPoints: DataPoint[], numImg: number, F0: number, Ff: number, mapX0: number, mapXf: number, mapY0: number, mapYf: number) => {
	console.log('dataPoints: ', dataPoints);
	console.log('numImg: ', numImg);
	console.log('F0: ', F0);
	console.log('Ff: ', Ff);
	console.log('mapX0: ', mapX0);
	console.log('mapY0: ', mapY0);
	console.log('mapXf: ', mapXf);
	console.log('mapYf: ', mapYf);

	const frameNums = Array.from({length: numImg}, (_, i) => F0 + i * Math.floor((Ff - F0) / numImg));

	for (const frameNum of frameNums) {
		console.log('frameNum: ', frameNum);
		const dataPoint = dataPoints.find((point) => point.frameNumber === frameNum);

		if (dataPoint) {
			console.log('dataPoint: ', dataPoint);
			const hue = (frameNum - F0) / (Ff - F0) * 255;
			ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.5)`;

			const x = ((dataPoint.locationX - mapX0) / (mapXf - mapX0)) * canvas.width;
			const y = ((dataPoint.locationY - mapY0) / (mapYf - mapY0)) * canvas.height;

			const arrowSize = 10;
			const angle = dataPoint.rotation + Math.PI / 2; // Add 90 degrees to make the arrow point in the correct direction

			ctx.beginPath();
			ctx.moveTo(x - arrowSize * Math.cos(angle - Math.PI / 6), y - arrowSize * Math.sin(angle - Math.PI / 6));
			ctx.lineTo(x + arrowSize * Math.cos(angle), y + arrowSize * Math.sin(angle));
			ctx.lineTo(x - arrowSize * Math.cos(angle + Math.PI / 6), y - arrowSize * Math.sin(angle + Math.PI / 6));
			ctx.closePath();
			ctx.fill();
		}
	}
};

// Load default data and draw on startup
const loadDefaultDataAndDraw = async () => {
	const numImg = parseInt(numImgInput.value);
	const F0 = parseInt(F0Input.value);
	const Ff = parseInt(FfInput.value);
	const mapX0 = parseInt(mapX0Input.value);
	const mapXf = parseInt(mapXfInput.value);
	const mapY0 = parseInt(mapY0Input.value);
	const mapYf = parseInt(mapYfInput.value);

	const dataPoints = await fetchAndParseCSV("resources/data.csv");
	await drawBackground("resources/background.svg");
	drawPlayerLocations(dataPoints, numImg, F0, Ff, mapX0, mapXf, mapY0, mapYf);
};

loadDefaultDataAndDraw();

// Event listeners
generateButton.addEventListener("click", async () => {
	const numImg = parseInt(numImgInput.value);
	const F0 = parseInt(F0Input.value);
	const Ff = parseInt(FfInput.value);
	const mapX0 = parseInt(mapX0Input.value);
	const mapXf = parseInt(mapXfInput.value);
	const mapY0 = parseInt(mapY0Input.value);
	const mapYf = parseInt(mapYfInput.value);
	const csvFile = csvFileInput.files && csvFileInput.files[0];
	const svgFile = svgFileInput.files && svgFileInput.files[0];

	if (csvFile && svgFile) {
		console.log("Reading CSV...");
		const csvData = await csvFile.text();
		console.log("Reading CSV... Done!");
		console.log("Parsing CSV...");
		const dataPoints = parseCSV(csvData);
		console.log("Parsing CSV... Done!");

		console.log("Drawing background...");
		await drawBackground(URL.createObjectURL(svgFile));
		console.log("Drawing background... Done!");
		console.log("Drawing data points...");
		drawPlayerLocations(dataPoints, numImg, F0, Ff, mapX0, mapXf, mapY0, mapYf);
		console.log("Drawing data points... Done!");
	}
});

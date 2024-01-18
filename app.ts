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
const arrowSizeInput = document.getElementById("arrowSize") as HTMLInputElement;
const cycleLengthInput = document.getElementById("cycleLength") as HTMLInputElement;
const csvFileInput = document.getElementById("csvFile") as HTMLInputElement;
const svgFileInput = document.getElementById("svgFile") as HTMLInputElement;
const generateButton = document.getElementById("generate") as HTMLButtonElement;
const startAnimationButton = document.getElementById("startAnimation") as HTMLButtonElement;
const presetSelect = document.getElementById("presetSelect") as HTMLSelectElement;
const canvas = document.getElementById("aniRGB-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

let animationInterval: number | null = null;
let dataPoints: DataPoint[] = [];

// Function to fetch and parse CSV data
const fetchAndParseCSV = async (url: string): Promise<DataPoint[]> => {
	const response = await fetch(url);
	const csv = await response.text();
	return parseCSV(csv);
};

// Function to parse CSV data
const parseCSV = (csv: string): DataPoint[] => {
	const lines = csv.split("\n");
	const parsedDataPoints: DataPoint[] = [];

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (line) {
			const [frameNumber, time, locationX, locationY, rotation, inputX, inputY] = line.split(",").map((value, index) => {
				console.log(`value: ${value}, index: ${index}`);
				return index === 1 ? value : parseFloat(value);
			});

			parsedDataPoints.push({frameNumber, time, locationX, locationY, rotation, inputX, inputY} as DataPoint);
		}
	}

	return parsedDataPoints;
};

// Function to filter data points based on the input values
const filterDataPoints = (dataPoints: DataPoint[], numImg: number, F0: number, Ff: number): DataPoint[] => {
	const frameNums = Array.from({length: numImg}, (_, i) => F0 + i * Math.floor((Ff - F0) / numImg));
	return dataPoints.filter((point) => frameNums.includes(point.frameNumber));
};

// Function to update map input values based on the data points
const updateMapValues = (dataPoints: DataPoint[]) => {
	let minX = Infinity;
	let maxX = -Infinity;
	let minY = Infinity;
	let maxY = -Infinity;
	let minFrame = Infinity;
	let maxFrame = -Infinity;

	for (const point of dataPoints) {
		minX = Math.min(minX, point.locationX);
		maxX = Math.max(maxX, point.locationX);
		minY = Math.min(minY, point.locationY);
		maxY = Math.max(maxY, point.locationY);
		minFrame = Math.min(minFrame, point.frameNumber);
		maxFrame = Math.max(maxFrame, point.frameNumber);
	}

	mapX0Input.value = minX.toString();
	mapXfInput.value = maxX.toString();
	mapY0Input.value = minY.toString();
	mapYfInput.value = maxY.toString();
	F0Input.value = minFrame.toString();
	FfInput.value = maxFrame.toString();
};

// Function to draw the background image
const drawBackground = async (url: string) => {
	const img = new Image();
	img.src = url;

	return new Promise((resolve) => {
		img.onload = () => {
			const aspectRatio = img.width / img.height;
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			console.log('draw background');
			resolve(null);
		};
	});
};

// Function to draw the player locations
const drawPlayerLocations = (dataPoints: DataPoint[], numImg: number, F0: number, Ff: number, mapX0: number, mapXf: number, mapY0: number, mapYf: number, arrowSize: number, currentTime: number | null) => {
	console.log('dataPoints: ', dataPoints);
	console.log('numImg: ', numImg);
	console.log('F0: ', F0);
	console.log('Ff: ', Ff);
	console.log('mapX0: ', mapX0);
	console.log('mapY0: ', mapY0);
	console.log('mapXf: ', mapXf);
	console.log('mapYf: ', mapYf);
	console.log('arrowSize: ', arrowSize);

	for (const dataPoint of dataPoints) {
		console.log('dataPoint: ', dataPoint);
		const hue = (dataPoint.frameNumber - F0) / (Ff - F0) * 360;

		const x = ((dataPoint.locationX - mapX0) / (mapXf - mapX0)) * canvas.width;
		const y = ((dataPoint.locationY - mapY0) / (mapYf - mapY0)) * canvas.height;

		const angle = ((dataPoint.rotation) % 360) * (Math.PI / 180); // Convert to radians and ensure it's within 0 to 360 degrees

		if (currentTime !== null) {
			const cycleLength = parseInt(cycleLengthInput.value) * 1000;
			const currentHue = (currentTime % cycleLength) / cycleLength * 360;
			const hueDifference = Math.min(Math.abs(currentHue - hue), Math.abs(currentHue - hue - 360), Math.abs(currentHue - hue + 360));
			const visibility = 1 - Math.min(hueDifference / 72, 1);

			ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${visibility})`;
		} else {
			ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
		}

		ctx.beginPath();
		ctx.moveTo(x - arrowSize * Math.cos(angle - Math.PI / 6), y - arrowSize * Math.sin(angle - Math.PI / 6));
		ctx.lineTo(x + arrowSize * Math.cos(angle), y + arrowSize * Math.sin(angle));
		ctx.lineTo(x - arrowSize * Math.cos(angle + Math.PI / 6), y - arrowSize * Math.sin(angle + Math.PI / 6));
		ctx.closePath();
		ctx.fill();
	}
};

// Load default data and draw on startup
const loadDefaultDataAndDraw = async () => {
	const numImg = parseInt(numImgInput.value);
	const F0 = parseInt(F0Input.value);
	const Ff = parseInt(FfInput.value);
	const arrowSize = parseInt(arrowSizeInput.value);

	dataPoints = await fetchAndParseCSV("resources/Restaurant_Frames.csv");
	dataPoints = filterDataPoints(dataPoints, numImg, F0, Ff);

	await applyPresetData("default");
	const mapX0 = parseInt(mapX0Input.value);
	const mapXf = parseInt(mapXfInput.value);
	const mapY0 = parseInt(mapY0Input.value);
	const mapYf = parseInt(mapYfInput.value);

	drawPlayerLocations(dataPoints, numImg, F0, Ff, mapX0, mapXf, mapY0, mapYf, arrowSize, null);
};

loadDefaultDataAndDraw();

// Function to load preset data
const loadPresetData = async (presetName: string) => {
	const response = await fetch(`resources/${presetName}/${presetName}.json`);
	const presetData = await response.json();
	return presetData;
};

// Function to apply preset data
const applyPresetData = async (presetName: string) => {
	const presetData = await loadPresetData(presetName);
	mapX0Input.value = presetData.mapX0;
	mapXfInput.value = presetData.mapXf;
	mapY0Input.value = presetData.mapY0;
	mapYfInput.value = presetData.mapYf;
	await drawBackground(`resources/${presetName}/${presetData.image}`);
};

// Event listener for preset selection
presetSelect.addEventListener("change", async () => {
	const presetName = presetSelect.value;
	await applyPresetData(presetName);
});

// Event listener for CSV file input
csvFileInput.addEventListener("change", async () => {
	const csvFile = csvFileInput.files && csvFileInput.files[0];
	const csvData = await csvFile.text();

	dataPoints = parseCSV(csvData);
	updateMapValues(dataPoints);
	generateImage();
});


// Event listener for SVG file input
svgFileInput.addEventListener("change", async () => {
	const svgFile = svgFileInput.files && svgFileInput.files[0];
	await drawBackground(URL.createObjectURL(svgFile));
});

const startAnimation = () => {
	if (animationInterval) {
		clearInterval(animationInterval);
	}

	animationInterval = setInterval(async () => {
		const numImg = parseInt(numImgInput.value);
		const F0 = parseInt(F0Input.value);
		const Ff = parseInt(FfInput.value);
		const mapX0 = parseInt(mapX0Input.value);
		const mapXf = parseInt(mapXfInput.value);
		const mapY0 = parseInt(mapY0Input.value);
		const mapYf = parseInt(mapYfInput.value);
		const arrowSize = parseInt(arrowSizeInput.value);
		const svgFile = svgFileInput.files && svgFileInput.files[0];

		if (svgFile) {
			console.log("Drawing background...");
			await drawBackground(URL.createObjectURL(svgFile));
			console.log("Drawing background... Done!");
		} else {
			console.log("Drawing preset background...");
			await applyPresetData(presetSelect.value);
			console.log("Drawing preset background... Done!");
		}

		drawPlayerLocations(dataPoints, numImg, F0, Ff, mapX0, mapXf, mapY0, mapYf, arrowSize, Date.now());
	}, 100);
};

// Event listeners
const generateImage = async () => {
	const numImg = parseInt(numImgInput.value);
	const F0 = parseInt(F0Input.value);
	const Ff = parseInt(FfInput.value);
	const mapX0 = parseInt(mapX0Input.value);
	const mapXf = parseInt(mapXfInput.value);
	const mapY0 = parseInt(mapY0Input.value);
	const mapYf = parseInt(mapYfInput.value);
	const arrowSize = parseInt(arrowSizeInput.value);
	const csvFile = csvFileInput.files && csvFileInput.files[0];
	const svgFile = svgFileInput.files && svgFileInput.files[0];

	if (csvFile) {
		console.log("Reading CSV...");
		const csvData = await csvFile.text();
		console.log("Reading CSV... Done!");
		console.log("Parsing CSV...");
		dataPoints = parseCSV(csvData);
		dataPoints = filterDataPoints(dataPoints, numImg, F0, Ff);
		console.log("Parsing CSV... Done!");

		if (svgFile) {
			console.log("Drawing background...");
			await drawBackground(URL.createObjectURL(svgFile));
			console.log("Drawing background... Done!");
		} else {
			console.log("Drawing preset background...");
			await applyPresetData(presetSelect.value);
			console.log("Drawing preset background... Done!");
		}

		console.log("Drawing data points...");
		drawPlayerLocations(dataPoints, numImg, F0, Ff, mapX0, mapXf, mapY0, mapYf, arrowSize, null);
		console.log("Drawing data points... Done!");
	}
};

generateButton.addEventListener("click", generateImage);
startAnimationButton.addEventListener("click", startAnimation);
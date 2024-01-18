// app.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
// DOM elements
console.log("Creating DOM elements");
var numImgInput = document.getElementById("numImg");
var F0Input = document.getElementById("F0");
var FfInput = document.getElementById("Ff");
var mapX0Input = document.getElementById("mapX0");
var mapXfInput = document.getElementById("mapXf");
var mapY0Input = document.getElementById("mapY0");
var mapYfInput = document.getElementById("mapYf");
var arrowSizeInput = document.getElementById("arrowSize");
var cycleLengthInput = document.getElementById("cycleLength");
var csvFileInput = document.getElementById("csvFile");
var svgFileInput = document.getElementById("svgFile");
var generateButton = document.getElementById("generate");
var startAnimationButton = document.getElementById("startAnimation");
var presetSelect = document.getElementById("presetSelect");
var canvas = document.getElementById("aniRGB-canvas");
var ctx = canvas.getContext("2d");
var animationInterval = null;
var dataPoints = [];
// Function to fetch and parse CSV data
var fetchAndParseCSV = function (url) { return __awaiter(_this, void 0, void 0, function () {
    var response, csv;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch(url)];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.text()];
            case 2:
                csv = _a.sent();
                return [2 /*return*/, parseCSV(csv)];
        }
    });
}); };
// Function to parse CSV data
var parseCSV = function (csv) {
    var lines = csv.split("\n");
    var parsedDataPoints = [];
    for (var i = 1; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line) {
            var _a = line.split(",").map(function (value, index) {
                console.log("value: ".concat(value, ", index: ").concat(index));
                return index === 1 ? value : parseFloat(value);
            }), frameNumber = _a[0], time = _a[1], locationX = _a[2], locationY = _a[3], rotation = _a[4], inputX = _a[5], inputY = _a[6];
            parsedDataPoints.push({ frameNumber: frameNumber, time: time, locationX: locationX, locationY: locationY, rotation: rotation, inputX: inputX, inputY: inputY });
        }
    }
    return parsedDataPoints;
};
// Function to filter data points based on the input values
var filterDataPoints = function (dataPoints, numImg, F0, Ff) {
    var frameNums = Array.from({ length: numImg }, function (_, i) { return F0 + i * Math.floor((Ff - F0) / numImg); });
    return dataPoints.filter(function (point) { return frameNums.includes(point.frameNumber); });
};
// Function to update map input values based on the data points
var updateMapValues = function (dataPoints) {
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    var minFrame = Infinity;
    var maxFrame = -Infinity;
    for (var _i = 0, dataPoints_1 = dataPoints; _i < dataPoints_1.length; _i++) {
        var point = dataPoints_1[_i];
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
var drawBackground = function (url) { return __awaiter(_this, void 0, void 0, function () {
    var img;
    return __generator(this, function (_a) {
        img = new Image();
        img.src = url;
        return [2 /*return*/, new Promise(function (resolve) {
                img.onload = function () {
                    var aspectRatio = img.width / img.height;
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    console.log('draw background');
                    resolve(null);
                };
            })];
    });
}); };
// Function to draw the player locations
var drawPlayerLocations = function (dataPoints, numImg, F0, Ff, mapX0, mapXf, mapY0, mapYf, arrowSize, currentTime) {
    console.log('dataPoints: ', dataPoints);
    console.log('numImg: ', numImg);
    console.log('F0: ', F0);
    console.log('Ff: ', Ff);
    console.log('mapX0: ', mapX0);
    console.log('mapY0: ', mapY0);
    console.log('mapXf: ', mapXf);
    console.log('mapYf: ', mapYf);
    console.log('arrowSize: ', arrowSize);
    for (var _i = 0, dataPoints_2 = dataPoints; _i < dataPoints_2.length; _i++) {
        var dataPoint = dataPoints_2[_i];
        console.log('dataPoint: ', dataPoint);
        var hue = (dataPoint.frameNumber - F0) / (Ff - F0) * 360;
        var x = ((dataPoint.locationX - mapX0) / (mapXf - mapX0)) * canvas.width;
        var y = ((dataPoint.locationY - mapY0) / (mapYf - mapY0)) * canvas.height;
        var angle = ((dataPoint.rotation) % 360) * (Math.PI / 180); // Convert to radians and ensure it's within 0 to 360 degrees
        if (currentTime !== null) {
            var cycleLength = parseInt(cycleLengthInput.value) * 1000;
            var currentHue = (currentTime % cycleLength) / cycleLength * 360;
            var hueDifference = Math.min(Math.abs(currentHue - hue), Math.abs(currentHue - hue - 360), Math.abs(currentHue - hue + 360));
            var visibility = 1 - Math.min(hueDifference / 72, 1);
            ctx.fillStyle = "hsla(".concat(hue, ", 100%, 50%, ").concat(visibility, ")");
        }
        else {
            ctx.fillStyle = "hsl(".concat(hue, ", 100%, 50%)");
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
var loadDefaultDataAndDraw = function () { return __awaiter(_this, void 0, void 0, function () {
    var numImg, F0, Ff, arrowSize, mapX0, mapXf, mapY0, mapYf;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                numImg = parseInt(numImgInput.value);
                F0 = parseInt(F0Input.value);
                Ff = parseInt(FfInput.value);
                arrowSize = parseInt(arrowSizeInput.value);
                return [4 /*yield*/, fetchAndParseCSV("resources/Restaurant_Frames.csv")];
            case 1:
                dataPoints = _a.sent();
                dataPoints = filterDataPoints(dataPoints, numImg, F0, Ff);
                return [4 /*yield*/, applyPresetData("default")];
            case 2:
                _a.sent();
                mapX0 = parseInt(mapX0Input.value);
                mapXf = parseInt(mapXfInput.value);
                mapY0 = parseInt(mapY0Input.value);
                mapYf = parseInt(mapYfInput.value);
                drawPlayerLocations(dataPoints, numImg, F0, Ff, mapX0, mapXf, mapY0, mapYf, arrowSize, null);
                return [2 /*return*/];
        }
    });
}); };
loadDefaultDataAndDraw();
// Function to load preset data
var loadPresetData = function (presetName) { return __awaiter(_this, void 0, void 0, function () {
    var response, presetData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch("resources/".concat(presetName, "/").concat(presetName, ".json"))];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 2:
                presetData = _a.sent();
                return [2 /*return*/, presetData];
        }
    });
}); };
// Function to apply preset data
var applyPresetData = function (presetName) { return __awaiter(_this, void 0, void 0, function () {
    var presetData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, loadPresetData(presetName)];
            case 1:
                presetData = _a.sent();
                mapX0Input.value = presetData.mapX0;
                mapXfInput.value = presetData.mapXf;
                mapY0Input.value = presetData.mapY0;
                mapYfInput.value = presetData.mapYf;
                return [4 /*yield*/, drawBackground("resources/".concat(presetName, "/").concat(presetData.image))];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
// Event listener for preset selection
presetSelect.addEventListener("change", function () { return __awaiter(_this, void 0, void 0, function () {
    var presetName;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                presetName = presetSelect.value;
                return [4 /*yield*/, applyPresetData(presetName)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Event listener for CSV file input
csvFileInput.addEventListener("change", function () { return __awaiter(_this, void 0, void 0, function () {
    var csvFile, csvData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                csvFile = csvFileInput.files && csvFileInput.files[0];
                return [4 /*yield*/, csvFile.text()];
            case 1:
                csvData = _a.sent();
                dataPoints = parseCSV(csvData);
                updateMapValues(dataPoints);
                generateImage();
                return [2 /*return*/];
        }
    });
}); });
// Event listener for SVG file input
svgFileInput.addEventListener("change", function () { return __awaiter(_this, void 0, void 0, function () {
    var svgFile;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                svgFile = svgFileInput.files && svgFileInput.files[0];
                return [4 /*yield*/, drawBackground(URL.createObjectURL(svgFile))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
var startAnimation = function () {
    if (animationInterval) {
        clearInterval(animationInterval);
    }
    animationInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
        var numImg, F0, Ff, mapX0, mapXf, mapY0, mapYf, arrowSize, svgFile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    numImg = parseInt(numImgInput.value);
                    F0 = parseInt(F0Input.value);
                    Ff = parseInt(FfInput.value);
                    mapX0 = parseInt(mapX0Input.value);
                    mapXf = parseInt(mapXfInput.value);
                    mapY0 = parseInt(mapY0Input.value);
                    mapYf = parseInt(mapYfInput.value);
                    arrowSize = parseInt(arrowSizeInput.value);
                    svgFile = svgFileInput.files && svgFileInput.files[0];
                    if (!svgFile) return [3 /*break*/, 2];
                    console.log("Drawing background...");
                    return [4 /*yield*/, drawBackground(URL.createObjectURL(svgFile))];
                case 1:
                    _a.sent();
                    console.log("Drawing background... Done!");
                    return [3 /*break*/, 4];
                case 2:
                    console.log("Drawing preset background...");
                    return [4 /*yield*/, applyPresetData(presetSelect.value)];
                case 3:
                    _a.sent();
                    console.log("Drawing preset background... Done!");
                    _a.label = 4;
                case 4:
                    drawPlayerLocations(dataPoints, numImg, F0, Ff, mapX0, mapXf, mapY0, mapYf, arrowSize, Date.now());
                    return [2 /*return*/];
            }
        });
    }); }, 100);
};
// Event listeners
var generateImage = function () { return __awaiter(_this, void 0, void 0, function () {
    var numImg, F0, Ff, mapX0, mapXf, mapY0, mapYf, arrowSize, csvFile, svgFile, csvData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                numImg = parseInt(numImgInput.value);
                F0 = parseInt(F0Input.value);
                Ff = parseInt(FfInput.value);
                mapX0 = parseInt(mapX0Input.value);
                mapXf = parseInt(mapXfInput.value);
                mapY0 = parseInt(mapY0Input.value);
                mapYf = parseInt(mapYfInput.value);
                arrowSize = parseInt(arrowSizeInput.value);
                csvFile = csvFileInput.files && csvFileInput.files[0];
                svgFile = svgFileInput.files && svgFileInput.files[0];
                if (!csvFile) return [3 /*break*/, 6];
                console.log("Reading CSV...");
                return [4 /*yield*/, csvFile.text()];
            case 1:
                csvData = _a.sent();
                console.log("Reading CSV... Done!");
                console.log("Parsing CSV...");
                dataPoints = parseCSV(csvData);
                dataPoints = filterDataPoints(dataPoints, numImg, F0, Ff);
                console.log("Parsing CSV... Done!");
                if (!svgFile) return [3 /*break*/, 3];
                console.log("Drawing background...");
                return [4 /*yield*/, drawBackground(URL.createObjectURL(svgFile))];
            case 2:
                _a.sent();
                console.log("Drawing background... Done!");
                return [3 /*break*/, 5];
            case 3:
                console.log("Drawing preset background...");
                return [4 /*yield*/, applyPresetData(presetSelect.value)];
            case 4:
                _a.sent();
                console.log("Drawing preset background... Done!");
                _a.label = 5;
            case 5:
                console.log("Drawing data points...");
                drawPlayerLocations(dataPoints, numImg, F0, Ff, mapX0, mapXf, mapY0, mapYf, arrowSize, null);
                console.log("Drawing data points... Done!");
                _a.label = 6;
            case 6: return [2 /*return*/];
        }
    });
}); };
generateButton.addEventListener("click", generateImage);
startAnimationButton.addEventListener("click", startAnimation);

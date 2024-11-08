// Extra math stuff
Math.TAU = 2 * Math.PI
Math.max = (a, b)=>{if(a>b){return a} else{return b}}
Math.min = (a, b)=>{if(a<b){return a} else{return b}}
Math.inBoundingBox = (pos, box)=>{
    let x = pos[0]
    let y = pos[1]
    let boxX = box[0]
    let boxY = box[1]
    let boxWidth = box[2] - boxX
    let boxHeight = box[3] - boxY

    return (
        x >= boxX && 
        x <= boxX + boxWidth && 
        y >= boxY && 
        y <= boxY + boxHeight
    )
}

// Canvas
const canvas = document.getElementById("canvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext("2d")

var screenWidthPixels = document.innerWidth
var screenWidthMeters = 0.5
var pixelsPerMeter = screenWidthPixels / screenWidthMeters

// consts
const kHzToHz = 1000

// Wave Params
var speedOfLight = 299_792_458
// c = wavLen * freq
var frequency = 0
var wavelength = speedOfLight / frequency
var periodicity = speedOfLight / frequency // 1 wave per 6 seconds = 0.007
var amplitude = 50 // unrelated, For the electromagnetic spectrum its the power of the trasmitter etc, for now its a user option

var wavelengthPixels = wavelength * pixelsPerMeter

function setFrequency(freq){
	frequency = freq
    wavelength = speedOfLight / frequency
    wavelengthPixels = wavelength * pixelsPerMeter
    periodicity = wavelength / speedOfLight
}
function setWavelength(waveLen){
    wavelength = waveLen
    frequency = speedOfLight / waveLen
    setFrequency(frequency)
}
function setPeriodicity(periodicity){
    wavelength = speedOfLight * periodicity
    setWavelength(wavelength)
}

// data
var waveColor = "#f0f0f0"
var axesColor = "#ffffff"
var amplitudeColor = "#ff8214"


var drawPrecision = 10
var pointSize = 5
var time = 0
var updateInterval = 1000 / 60 // 60 FPS
var screenCenter = Math.floor(canvas.height/2)
var amplitudeBoundingBox = [0,0,0,0]
var mousePos = [0,0]

var closestToInfoPoint = Infinity;
var infoPointIndex = 50;

var dataPoints = []
for(let i=0; i<canvas.width; i++){
	dataPoints.push({
  	"x": i,
    "y": screenCenter
  })
}

// drawing functions
function clearScreen(){
	ctx.fillStyle = "#222222"
	ctx.fillRect(0, 0, canvas.width, canvas.height)
}
function drawPoint(x, y, color){
    if(color != null){ ctx.fillStyle = color }

	ctx.beginPath()
    ctx.arc(x, y, pointSize, 0, 2*Math.TAU)
    ctx.fill()
}

function drawPoints(){
	for(let i=0; i<dataPoints.length; i += drawPrecision){
        let data = dataPoints[i]

        let height = data["y"]-screenCenter
        percentPeriod = Math.abs(height) / amplitude
        let newWaveColor = null

        if(height < 0){
            newWaveColor = "rgb("+ percentPeriod*255 +",0,0)"
        }
        else{
            newWaveColor = "rgb(0,0,"+ percentPeriod*255 +")"
        }

        let drawColor = waveColor
        if(newWaveColor){drawColor = newWaveColor}

        drawPoint(data["x"], data["y"], drawColor)
    }
}

function calculateNearestInfoPoint(){
    closestToInfoPoint = Infinity

	for(let i=0; i<dataPoints.length; i += drawPrecision){
        let distFromInfoPoint = infoPointIndex - i
        if(Math.abs(distFromInfoPoint) < Math.abs(infoPointIndex - closestToInfoPoint)){
            closestToInfoPoint = i
        }
    }
}

function updatePoints(t){
    // let's use a sine wave
    for(let i=0; i<dataPoints.length; i++){
        let data = dataPoints[i]
        let xPos = data["x"]

        data["y"] = amplitude * Math.sin(periodicity * xPos + t)
        data["y"] += screenCenter
    }
}

function drawAxes(){
    ctx.strokeStyle = axesColor
    ctx.lineWidth = 2

    // X-Axis
    ctx.beginPath()
    ctx.moveTo(0, screenCenter)
    ctx.lineTo(canvas.width, screenCenter)
    ctx.stroke()

    // Y-Axis
    ctx.beginPath()
    ctx.moveTo(ctx.lineWidth-1, 0)
    ctx.lineTo(ctx.lineWidth-1, canvas.height)
    ctx.stroke()
}

function drawAmplitude(x, y){
    ctx.strokeStyle = amplitudeColor
    ctx.fillStyle = amplitudeColor
    ctx.lineWidth = 2

    doublePointSize = pointSize*2

    amplitudeBoundingBox = [x-doublePointSize, screenCenter-amplitude, 160, screenCenter+amplitude]

    ctx.beginPath()
    ctx.moveTo(x - doublePointSize, y)
    ctx.lineTo(x + doublePointSize, y)

    ctx.moveTo(x, y)
    ctx.lineTo(x, screenCenter)

    ctx.moveTo(x - doublePointSize, screenCenter)
    ctx.lineTo(x + doublePointSize, screenCenter)
    ctx.stroke()

    ctx.font = "20px monospace";
    ctx.fillText("Amplitude", x + doublePointSize, (y+screenCenter)/2 + 10);
}

setFrequency(100)

setInterval(()=>{
    clearScreen()
    // Update info needed
    updatePoints(time / 1000)
    calculateNearestInfoPoint()
    let infoPoint = dataPoints[closestToInfoPoint]
    let drawOrderOfAmp = Math.inBoundingBox(mousePos, amplitudeBoundingBox)

    // GUI
    drawAxes()

    if(drawOrderOfAmp == false){ drawAmplitude(infoPoint["x"], infoPoint["y"]) }
    
    // Points
    drawPoints()

    if(drawOrderOfAmp == true){ drawAmplitude(infoPoint["x"], infoPoint["y"]) }

    time += updateInterval
}, updateInterval)


document.addEventListener("mousemove", (e)=>{
    mousePos = [e.clientX, e.clientY]
})

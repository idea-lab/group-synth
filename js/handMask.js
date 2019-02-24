// In this case, We set width 320, and the height will be computed based on the input stream.
let width = 720;
let height = 0;

// whether streaming video from the camera.
let streaming = false;

let video = document.getElementById("video");
let stream = null;
let vc = null;
let noteInfo = document.getElementById("note");

function startCamera() {
if (streaming) return;
navigator.mediaDevices.getUserMedia({video: true, audio: false})
.then(function(s) {
stream = s;
video.srcObject = s;
video.play();
})
.catch(function(err) {
console.log("An error occured! " + err);
});

video.addEventListener("canplay", function(ev){
if (!streaming) {
  height = video.videoHeight / (video.videoWidth/width);
  video.setAttribute("width", width);
  video.setAttribute("height", height);
  streaming = true;
  vc = new cv.VideoCapture(video);
}
startVideoProcessing();
}, false);
}

let lastFilter = '';
let src = null;
let dstC1 = null;
let dstC3 = null;
let dstC4 = null;

function startVideoProcessing() {
if (!streaming) { console.warn("Please startup your webcam"); return; }
stopVideoProcessing();
src = new cv.Mat(height, width, cv.CV_8UC4);
requestAnimationFrame(processVideo);
}
function processVideo() {
  vc.read(src);
  hand = find_hand(src);
  var handMin = new cv.Point(hand[0], hand[1]);
  var handMax = new cv.Point(hand[2], hand[3]);
  cv.rectangle(src, handMin, handMax, new cv.Scalar(255, 0, 0), 2, cv.LINE_AA, 0);
  var handCenter = getCenter();
  var sound = xyToFreqAmp(handCenter[0], handCenter[1]);
  //noteInfo.innerHTML = "Frequency: " + sound[0] + "Amplitude: " + sound[1];
  // console.log(sound);
  //cv.imshow("canvasOutput", src);
  requestAnimationFrame(processVideo);
}

function stopVideoProcessing() {
if (src != null && !src.isDeleted()) src.delete();
if (dstC1 != null && !dstC1.isDeleted()) dstC1.delete();
if (dstC3 != null && !dstC3.isDeleted()) dstC3.delete();
if (dstC4 != null && !dstC4.isDeleted()) dstC4.delete();
}

function stopCamera() {
if (!streaming) return;
stopVideoProcessing();
document.getElementById("canvasOutput").getContext("2d").clearRect(0, 0, width, height);
video.pause();
video.srcObject=null;
stream.getVideoTracks()[0].stop();
streaming = false;
}

function opencvIsReady() {
console.log('OpenCV.js is ready');
initUI();
startCamera();
}
    
function getCenter(){
  hand = find_hand(src);
  return imgXYtoScrXY(width - bounds_center(hand)[0], bounds_center(hand)[1]);
}

function xyToFreqAmp(x, y)
{
	var freq = x * (3200-50) / window.innerWidth + 50;
	var amp = y / window.innerHeight;
	return [freq, amp];
}

function imgXYtoScrXY(x, y)
{
  var scrX = x * window.innerWidth / width;
  var scrY = y * window.innerHeight / height;

  return [scrX, scrY];
}

startCamera();

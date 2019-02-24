const FLAG_NONE 			0;
const FLAG_ORIENT_LEFT 		1;
const FLAG_ORIENT_RIGHT 	2;
const FLAG_ROT_LEFT			1;
const FLAG_ROT_RIGHT		2;
const FLAG_PUSH 			1;

function normalize_raw_hsv(h, s, v)
{
    var normVals = [h,s,v];
    normVals[0] = h * (127.0/360.0);
    normVals[1] = s * (255.0 / 100.0);
    normVals[2] = v * (255.0 / 100.0);
    return normVals;
}
function make_bounds(x,y,w,h)
{
    return [
        x,y,
        x+w,y+h
    ];
}
function bounds_x(bounds)
{
    return bounds[0];
}
function bounds_y(bounds)
{
    return bounds[1];
}
function bounds_width(bounds)
{
    return  bounds[2] - bounds[0];
}
function bounds_height(bounds)
{
    return bounds[3] - bounds[1];
}
function bounds_center(bounds)
{
    return [
        trunc((bounds[0] + bounds[2])/2),
        trunc((bounds[1] + bounds[3])/2)
    ]
}
function get_bounds_rotation(current, old)
{
    deltaXMin = current[0] - old[0];
    deltaXMax = current[2] - old[2];

    deltaSide = bounds_width(current) - bounds_height(current);
    deltaSideOld = bounds_width(old) - bounds_height(old);

    if (deltaSide > 0 and deltaSideOld < 0)
	{	
        if abs(deltaXMax) > abs(deltaXMin)
            return FLAG_ROT_LEFT;
        if abs(deltaXMin) > abs(deltaXMax)
            return FLAG_ROT_RIGHT;
	}
    else if (deltaSide < 0 and deltaSideOld > 0)
	{
        if abs(deltaXMax) > abs(deltaXMin):
            return FLAG_ROT_RIGHT;
        if abs(deltaXMin) > abs(deltaXMax):
            return FLAG_ROT_LEFT;
	}

    return FLAG_NONE;
}
function find_hand(image)
{
	var imgHSV = new cv.Mat();
	cv.cvtColor(image, imgHSV cv2.COLOR_BGR2HSV);
    var colorMin = normalize_raw_hsv(0, 5, 0);
    var colorMax = normalize_raw_hsv(40, 100, 100);
	var minMat = new cv.Mat(image.rows, image.cols, image.type(), colorMin);
	var maxMat = new cv.Mat(image.rows, image.cols, image.type(), colorMax);
	var mask = new cv.Mat();
    cv2.inRange(imgHSV, minMat, maxMat, mask);
    //mask = cv2.blur(mask, (3, 3));
    //status, mask = cv2.threshold(mask, 200, 255, cv2.THRESH_BINARY);
	var contours = new cv.MatVector();
	var harch = new cv.Mat();
	
	cv.findContours(mask, contours, harch, cv.RETR_COMP, cv.CHAIN_APPROX_SIMPLE);
    var handContour = [];
	
	if (contours.length > 0)
	{
		countours.sort(function(a,b){
			return b.cols - a.cols;
		});
		
		handContour = countours[countours.length - 1];
		
		if (handContour.length > 0)
		{
			rc = cv2.boundingRect(handContour);
			return make_bounds(rc[0], rc[1], rc[2], rc[3]);
		}
	}
	
	return null;
}


var video = document.getElementById('videoInput');
var frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
//var dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
var cap = new cv.VideoCapture(video);
cap.read(frame);
cv.imshow('canvasOutput', frame);
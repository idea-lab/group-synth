//Flags for gestures
const FLAG_NONE =			0;
const FLAG_ORIENT_LEFT = 	1;
const FLAG_ORIENT_RIGHT =	2;
const FLAG_ROT_LEFT =		1;
const FLAG_ROT_RIGHT =		2;
const FLAG_PUSH =			1;

//Function to convert 360-100-100 HSV to 180-255-255 HSV
function normalize_raw_hsv(h, s, v)
{
    var normVals = [h,s,v, 0];
    normVals[0] = h * (180.0/360.0);
    normVals[1] = s * (255.0 / 100.0);
    normVals[2] = v * (255.0 / 100.0);
    return normVals;
}

//Function that converts a rect to a bounds struct
function make_bounds(x,y,w,h)
{
    return [
        x,y,
        x+w,y+h
    ];
}

//Function that returns the x-coord of a bounds struct
function bounds_x(bounds)
{
    return bounds[0];
}
//Function that returns the y-coord of a bounds struct
function bounds_y(bounds)
{
    return bounds[1];
}
//Function that returns the width of a bounds struct
function bounds_width(bounds)
{
    return  bounds[2] - bounds[0];
}
//Function that returns the height of a bounds struct
function bounds_height(bounds)
{
    return bounds[3] - bounds[1];
}
//Function that returns the center [x, y] of a bounds struct
function bounds_center(bounds)
{
    return [
        Math.trunc((bounds[0] + bounds[2])/2),
        Math.trunc((bounds[1] + bounds[3])/2)
    ]
}
//Function that gets rotation flags between two states of a bounds
function get_bounds_rotation(current, old)
{
    deltaXMin = current[0] - old[0];
    deltaXMax = current[2] - old[2];

    deltaSide = bounds_width(current) - bounds_height(current);
    deltaSideOld = bounds_width(old) - bounds_height(old);

    if (deltaSide > 0 && deltaSideOld < 0)
	{
        if (Math.abs(deltaXMax) > Math.abs(deltaXMin))
            return FLAG_ROT_LEFT;
        if (Math.abs(deltaXMin) > Math.abs(deltaXMax))
            return FLAG_ROT_RIGHT;
	}
    else if (deltaSide < 0 && deltaSideOld > 0)
	{
        if (Math.abs(deltaXMax) > Math.abs(deltaXMin))
            return FLAG_ROT_RIGHT;
        if (Math.abs(deltaXMin) > Math.abs(deltaXMax))
            return FLAG_ROT_LEFT;
	}

    return FLAG_NONE;
}
//Function that creates a bounds struct corresponding to a hand-like object in an image
function find_hand(image)
{
	var imgHSV = new cv.Mat();
	cv.cvtColor(image, imgHSV, cv.COLOR_RGB2HSV, 0);
    var colorMin = normalize_raw_hsv(0, 5, 0);
    var colorMax = normalize_raw_hsv(40, 100, 100);
	colorMax[3] = 255;
	var minMat = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), colorMin);
	var maxMat = new cv.Mat(imgHSV.rows, imgHSV.cols, imgHSV.type(), colorMax);
	var mask = new cv.Mat();
    cv.inRange(imgHSV, minMat, maxMat, mask);
    //mask = cv2.blur(mask, (3, 3));
    //status, mask = cv2.threshold(mask, 200, 255, cv2.THRESH_BINARY);
	var contours = new cv.MatVector();
	var harch = new cv.Mat();

	cv.findContours(mask, contours, harch, Number(cv.RETR_COMP), Number(cv.CHAIN_APPROX_SIMPLE));
    var handContour = [];

	if (contours.size() > 0)
	{
		var maxIdx = 0;
		var maxSize = contours.get(0).rows;
		for(var i = 0; i < contours.size(); i++)
		{
			if (contours.get(i).rows > maxSize)
			{
				maxSize = contours.get(i).rows;
				maxIdx = i;
			}
		}

		handContour = contours.get(maxIdx);

		if (handContour.rows > 0)
		{
			rc = cv.boundingRect(handContour);

			minMat.delete();
			maxMat.delete();
			imgHSV.delete();
			contours.delete();
			harch.delete();
      mask.delete();
			return make_bounds(rc.x, rc.y, rc.width, rc.height);
		}
	}

	minMat.delete();
	maxMat.delete();
	imgHSV.delete();
	contours.delete();
	harch.delete();
	mask.delete();
	return null;
}

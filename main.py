'''----------------------------------------------
-------------------------------------------------

IMPORTS

-------------------------------------------------
----------------------------------------------'''
#import threading
import numpy as np
import cv2

'''----------------------------------------------
-------------------------------------------------

FLAG DEFINITIONS

-------------------------------------------------
----------------------------------------------'''
def FLAG_NONE():
    return 0

def FLAG_ORIENT_LEFT():
    return 1

def FLAG_ORIENT_RIGHT():
    return 2

def FLAG_ROT_LEFT():
    return 1

def FLAG_ROT_RIGHT():
    return 2

def FLAG_PUSH():
    return 1

'''----------------------------------------------
-------------------------------------------------

HELPER FUNCTIONS

-------------------------------------------------
----------------------------------------------'''
def normalize_raw_hsv(h, s, v):
    normVals = np.array([h,s,v])
    normVals[0] = h * (127.0/360.0)
    normVals[1] = s * (255.0 / 100.0)
    normVals[2] = v * (255.0 / 100.0)
    return normVals

def make_bounds(x,y,w,h):
    return [
        (x,y),
        (x+w,y+h)
    ]

def bounds_x(bounds):
    return bounds[0][0]

def bounds_y(bounds):
    return bounds[0][1]

def bounds_width(bounds):
    return  bounds[1][0] - bounds[0][0]

def bounds_height(bounds):
    return bounds[1][1] - bounds[0][1]

def bounds_center(bounds):
    return (
        int((bounds[0][0] + bounds[1][0])/2),
        int((bounds[0][1] + bounds[1][1])/2)
    )

def split_bounds_vert(bounds):
    hCenter = int(bounds_width(bounds) / 2)
    minL = (bounds[0][0], bounds[0][1])
    maxL = (hCenter, bounds[1][1])
    minR = (hCenter, bounds[0][1])
    maxR = (bounds[1][0], bounds[1][1])
    return [(minL, maxL), (minR, maxR)]

def split_bounds_horiz(bounds):
    vCenter = int(bounds_height(bounds) / 2)
    minT = bounds(bounds[0][0], bounds[0][1])
    maxT = bounds(bounds[1][0], vCenter)
    minB = bounds(bounds[0][0], vCenter)
    maxB = bounds(bounds[1][0], bounds[1][1])
    return [(minT, maxT), (minB, maxB)]

def get_bounds_rotation(current, old):
    deltaXMin = current[0][0] - old[0][0]
    deltaXMax = current[1][0] - old[1][0]

    deltaSide = bounds_width(current) - bounds_height(current)
    deltaSideOld = bounds_width(old) - bounds_height(old)

    if deltaSide > 0 and deltaSideOld < 0:      # [===] --> []
        if abs(deltaXMax) > abs(deltaXMin):
            return FLAG_ROT_LEFT()
        if abs(deltaXMin) > abs(deltaXMax):
            return FLAG_ROT_RIGHT()
    elif deltaSide < 0 and deltaSideOld > 0:    # [] --> [===]
        if abs(deltaXMax) > abs(deltaXMin):
            return FLAG_ROT_RIGHT()
        if abs(deltaXMin) > abs(deltaXMax):
            return FLAG_ROT_LEFT()

    return FLAG_NONE()

def get_bounds_push(current, old):
    deltaH = bounds_height(current) - bounds_height(old)
    deltaW = bounds_width(current) - bounds_width(old)

    if deltaH < 0 and abs(deltaH) > abs(deltaW):
        return FLAG_PUSH()

    return FLAG_NONE()



'''----------------------------------------------
-------------------------------------------------

GESTURE FLAG VARIABLES

-------------------------------------------------
----------------------------------------------'''
ORIENT_FLAGS = FLAG_ORIENT_LEFT()
ROT_FLAGS = 0
PUSH_FLAGS = 0


'''----------------------------------------------
-------------------------------------------------

VID CAPTURE VARIABLES

-------------------------------------------------
----------------------------------------------'''
CAP_WIDTH = 1280
CAP_HEIGHT = 720
vidCap = cv2.VideoCapture(0)
vidCap.set(cv2.CAP_PROP_FRAME_WIDTH, CAP_WIDTH)
vidCap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAP_HEIGHT)
frameCount = 0
oldBounds = []


mainWin = cv2.namedWindow('GroupSynth')

'''----------------------------------------------
-------------------------------------------------

PROGRAM LOOP

-------------------------------------------------
----------------------------------------------'''
while True:
    '''----------------------------------------------
    -------------------------------------------------

    KEY EVENTS

    -------------------------------------------------
    ----------------------------------------------'''
    #Exit on escape
    if cv2.waitKey(1) == 27: # ESCAPE KEY
        break
    #Swap orientation on Q
    if cv2.waitKey(1) == 113: # Q key
        if ORIENT_FLAGS == FLAG_ORIENT_LEFT():
            ORIENT_FLAGS = FLAG_ORIENT_RIGHT()
        else:
            ORIENT_FLAGS = FLAG_ORIENT_LEFT()

    '''----------------------------------------------
    -------------------------------------------------

    USER SETTING HANDLING

    -------------------------------------------------
    ----------------------------------------------'''
    #Set tracking region based on orientation
    if ORIENT_FLAGS == FLAG_ORIENT_RIGHT():
        trackBounds = [
            (int(CAP_WIDTH * 0.05), int(CAP_HEIGHT * 0.05)),
            (int(CAP_WIDTH * 0.6), int(CAP_HEIGHT * 0.95))
        ]
    elif ORIENT_FLAGS == FLAG_ORIENT_LEFT():
        trackBounds = [
            (int(CAP_WIDTH * 0.4), int(CAP_HEIGHT * 0.05)),
            (int(CAP_WIDTH * 0.95), int(CAP_HEIGHT * 0.95))
        ]

    '''----------------------------------------------
    -------------------------------------------------

    FRAME CAPTURE

    -------------------------------------------------
    ----------------------------------------------'''
    #Get the RGB frame and increment frame count
    status, frameBGR = vidCap.read()
    frameCount += 1

    '''----------------------------------------------
    -------------------------------------------------

    MASK CREATION

    -------------------------------------------------
    ----------------------------------------------'''
    #Restrict Region
    trackBGR = frameBGR[trackBounds[0][1]:trackBounds[1][1], trackBounds[0][0]:trackBounds[1][0]]
    #Create HSV equivalent
    trackHSV = cv2.cvtColor(trackBGR, cv2.COLOR_BGR2HSV)
    #Define skin tone ranges
    colorMin = normalize_raw_hsv(0, 5, 0)
    colorMax = normalize_raw_hsv(40, 100, 100)
    #Create mask based on skin tone
    trackMask = cv2.inRange(trackHSV, colorMin, colorMax)
    trackMask = cv2.blur(trackMask, (3, 3))
    status, trackMask = cv2.threshold(trackMask, 200, 255, cv2.THRESH_BINARY)

    '''----------------------------------------------
    -------------------------------------------------

    HAND RECOGNITION

    -------------------------------------------------
    ----------------------------------------------'''
    #Find all outlines
    contours, harch = cv2.findContours(trackMask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    #Outline for hand
    handContour = []
    #Bounding rect for hand
    handBounds = []

    #Set outline of hand to largest found outline
    if len(contours) > 0:
        handContour = (sorted(contours, key = len))[-1]
        #trackBGR = cv2.drawContours(trackBGR, handContour, -1, (0, 0, 255), 3)

    #Set bounds of hand to bounds of outline
    if len(handContour) > 0:
        handBounds = make_bounds(*cv2.boundingRect(handContour))
        #Set initial 'old' bounds to found bounds
        if len(oldBounds) == 0:
            oldBounds = handBounds
        #Create a convex hull based on hand outline
        hull = [cv2.convexHull(handContour)]
        #Draw hull and bounds
        trackBGR = cv2.drawContours(trackBGR, hull, -1, (0, 255, 0), 3)
        trackBGR = cv2.rectangle(trackBGR, handBounds[0], handBounds[1], (0, 255, 255))

    '''----------------------------------------------
    -------------------------------------------------

    GESTURE HANDLING

    -------------------------------------------------
    ----------------------------------------------'''
    #Verify that hand is found and limit number of updates per second
    if len(handBounds) > 0 and len(oldBounds) > 0 and frameCount > 10:
        handCenter = bounds_center(handBounds)
        oldCenter = bounds_center(oldBounds)
        trackBGR = cv2.line(trackBGR, oldCenter, handCenter, (255, 0, 0), 2)
        #Check for rotations
        ROT_FLAGS = get_bounds_rotation(handBounds, oldBounds)
        if ROT_FLAGS == FLAG_ROT_LEFT():
            print('Left Rot')
        elif ROT_FLAGS == FLAG_ROT_RIGHT():
            print('Right Rot')

        #Check for push
        #PUSH_FLAGS = get_bounds_push(handBounds, oldBounds)
        #if PUSH_FLAGS == FLAG_PUSH():
            #print('Push')
        #Set 'old' bounds to handled bounds and reset frame counter
        oldBounds = handBounds
        frameCount = 0

    '''----------------------------------------------
    -------------------------------------------------

    DISPLAY

    -------------------------------------------------
    ----------------------------------------------'''
    #Draw frame with guidelines
    frameBGR = cv2.rectangle(frameBGR, trackBounds[0], trackBounds[1], (0, 150, 255))
    cv2.imshow('GroupSynth', frameBGR)


'''----------------------------------------------
-------------------------------------------------

CLEAN UP

-------------------------------------------------
----------------------------------------------'''
cv2.destroyAllWindows()
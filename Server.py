import csv
import datetime
import time
from os.path import exists

import serial
import socketio
from aiohttp import web

port = "COM7"
ser = None

sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

background_handler = None

writeToFile = False
fileName = ""
fileHeaders = []
fileData = []


async def saveToFile(line):
    if writeToFile and len(fileHeaders) > 0:
        data = line.split(";")
        data.pop()
        tempDict = {}
        tempDict["timestamp"] = str(datetime.datetime.now())
        for i in data:
            telemetry = i.split(":")
            telemetryHeader = telemetry[0]
            telemetryValue = telemetry[1]
            if telemetryHeader in fileHeaders:
                tempDict[telemetryHeader] = telemetryValue
        fileData.append(tempDict)

        if len(fileData) > 50:
            file_exists = exists(fileName)
            temp = fileHeaders.copy()
            temp.insert(0, "timestamp")
            if file_exists:
                with open(fileName, 'a', encoding='UTF8') as f:
                    writer = csv.DictWriter(f, fieldnames=temp)
                    writer.writerows(fileData)
            else:
                with open(fileName, 'w') as f:

                    writer = csv.DictWriter(f, fieldnames=temp)
                    writer.writeheader()
                    writer.writerows(fileData)


async def background_task():
    while ser.is_open:
        await sio.sleep(0.01)
        try:
            line = ser.readline().decode('utf-8').strip()
            await saveToFile(line)
            await sio.emit('returnData', {"data": line, "time": round(time.time() * 1000)})
        except UnicodeDecodeError:
            print("Unicode error")


@sio.event
async def attach(sid, newPort):
    global ser
    global port
    port = newPort
    ser = serial.Serial(port, 9600)
    global background_handler
    background_handler = sio.start_background_task(background_task)


@sio.event
async def detach(sid):
    ser.close()
    background_handler.cancel()


@sio.event
async def saveStatus(sid, data):
    global writeToFile
    global fileHeaders
    global fileName
    writeToFile = data["status"]
    if writeToFile:
        fileHeaders = data["fileHeader"]
        fileName = data["fileName"]
        print(fileHeaders)
        print(fileName)
        print(writeToFile)


@sio.event
async def status(sid):
    await sio.emit("returnStatus", ser.is_open if ser is not None else False)


@sio.event
async def connect(sid, environ):
    print("connect ", sid)
    await status(sid)


@sio.event
def disconnect(sid):
    print('disconnect ', sid)


async def init_app():
    # global background_handler
    # background_handler = sio.start_background_task(background_task)

    return app


if __name__ == '__main__':
    web.run_app(init_app(), port=8080)

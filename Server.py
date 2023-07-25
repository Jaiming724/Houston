import csv
import datetime
import time
from os.path import exists

import serial
import socketio
from aiohttp import web

from Packet import ModifyPacket

port = "COM4"
ser = None

sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

background_handler = None

shouldWriteToFile = False
fileName = ""
fileHeaders = []
fileData = []
final_buf = []


async def writeToFile():
    file_exists = exists(fileName)
    temp = fileHeaders.copy()
    temp.insert(0, "timestamp")
    if file_exists:
        with open(fileName, 'a', encoding='UTF8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=temp)
            writer.writerows(fileData)
    else:
        with open(fileName, 'w', newline='') as f:

            writer = csv.DictWriter(f, fieldnames=temp)
            writer.writeheader()
            writer.writerows(fileData)
    fileData.clear()


async def saveToFile(line):
    if shouldWriteToFile and len(fileHeaders) > 0:
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

        if len(fileData) > 100:
            await writeToFile()


async def background_task():
    while ser.is_open:
        await sio.sleep(0.01)
        try:
            line = ser.readline().decode('utf-8').strip().replace("\n", "")
            if line[:4] == "CWC!":
                await saveToFile(line[4:])
                await sio.emit('returnData', {"data": line[4:], "time": round(time.time() * 1000)})
            elif line[:5] == "CWCA!":

                d = line[5:]
                if len(d) > 0:
                    print(d)
                else:
                    print("nothing")
                await sio.emit("alert", line[5:])
            elif line[:5] == "CWCM!":
                await sio.emit("mapData", line[5:])
        except UnicodeDecodeError:
            print("Unicode error")


@sio.event
async def attach(sid, newPort):
    global ser
    global port
    port = newPort
    ser = serial.Serial(port, 9600, timeout=3)
    global background_handler
    background_handler = sio.start_background_task(background_task)


@sio.event
async def detach(sid):
    ser.close()
    background_handler.cancel()


@sio.event
async def saveStatus(sid, data):
    global shouldWriteToFile
    global fileHeaders
    global fileName
    shouldWriteToFile = data["status"]
    if shouldWriteToFile:
        fileHeaders = data["fileHeader"]
        fileName = data["fileName"]
    else:
        await writeToFile()


@sio.event
async def newValue(sid, data):
    print(data["key"])
    v = int(data["value"])
    num_bytes = v.to_bytes(4, 'little')

    packet = ModifyPacket(13, "NA", 267, "I")

    ser.write(packet.data)


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
    #     global ser
    #     global port
    #     port = "COM4"
    #     ser = serial.Serial(port, 9600, timeout=3)
    #
    #     background_handler = sio.start_background_task(background_task)

    return app


if __name__ == '__main__':
    web.run_app(init_app(), port=8080)

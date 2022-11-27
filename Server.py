import time

import serial
import socketio
from aiohttp import web

port = "COM7"
ser = None

sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

background_handler = None


async def background_task():
    while ser.is_open:
        await sio.sleep(0.01)
        try:
            line = ser.readline().decode('utf-8').strip()
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

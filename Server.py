import serial
from aiohttp import web
import socketio

ser = serial.Serial('COM5', 9600)

sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)


async def background_task():
    while True:
        await sio.sleep(0.01)
        try:
            line = ser.readline().decode('utf-8').strip()
            await sio.emit('returnData', line)
        except UnicodeDecodeError:
            print("Unicode error")


@sio.event
def connect(sid, environ):
    print("connect ", sid)


@sio.event
async def chat_message(sid, data):
    print("message ", data)


@sio.event
def disconnect(sid):
    print('disconnect ', sid)


async def init_app():
    sio.start_background_task(background_task)
    return app


if __name__ == '__main__':
    web.run_app(init_app(), port=8080)

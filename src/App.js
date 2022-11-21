import React, {useState, useEffect} from 'react';
import io from 'socket.io-client';

const socket = io.connect("http://localhost:8080");

function App() {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [num, setNum] = useState('')
    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });


        socket.on('returnData', (data) => {
            setNum(data)
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('returnData');
        };
    }, []);


    return (
        <div>
            <p>Connected: {'' + isConnected}</p>
            <p>Last pong: {num || '-'}</p>
        </div>
    );
}

export default App;

import React, {useState, useEffect} from 'react';
import io from 'socket.io-client';
import {Button} from "@mui/material";
import Header from "./components/Header";

const socket = io.connect("http://localhost:8080");

function App() {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [isSerialConnected, setSerialConnected] = useState(false);
    const [ping, setPing] = useState(0);
    const [Telemetry, setTelemetry] = useState([])
    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });


        socket.on('returnData', (data) => {
            setTelemetry(data["data"].split(";"));
            setPing(Date.now() - data["time"])
        });

        socket.on('returnStatus', (data) => {
            if (data === true) {
                setSerialConnected(true);
            } else {
                setSerialConnected(false);
            }

        });
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('returnData');
        };
    }, []);


    function changeSerialStatus() {
        if (isSerialConnected) {
            socket.emit("detach");
        } else {
            socket.emit("attach");
        }
        setSerialConnected(!isSerialConnected);
    }

    return (
        <div>
            <Header ping={ping}/>
            <p>Socket Connected: {'' + isConnected}</p>
            <p>Serial Connected: {'' + isSerialConnected}</p>
            <div>
                {Telemetry.map((ele) => (
                    <p>{ele}</p>
                ))}
            </div>
            <Button color={`${isSerialConnected ? 'error' : 'success'}`} variant="contained"
                    onClick={changeSerialStatus}>{isSerialConnected ? "Detach" : "Attach"}
            </Button>

        </div>
    );
}

export default App;

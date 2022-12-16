import React, {useEffect, useState} from 'react';
import io from 'socket.io-client';
import Header from "./components/Header";
import StatusCard from "./components/StatusCard";
import TelemetryCard from "./components/TelemetryCard";
import Graph from "./components/Graph";

const socket = io.connect("http://localhost:8080");

function App() {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [isSerialConnected, setSerialConnected] = useState(false);
    const [ping, setPing] = useState(0);
    const [Telemetry, setTelemetry] = useState([])
    const [ip, setIP] = useState("http://localhost:8080")
    const [port, setPort] = useState("COM7")
    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });


        socket.on('returnData', (data) => {
            let tele = data["data"].split(";")
            tele.pop()
            setTelemetry(tele);
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


    return (
        <div>
            <Header ping={ping}/>

            <div className="flex">
                <StatusCard isSocketConnected={isConnected} isSerialConnected={isSerialConnected} socket={socket}
                            setSerialConnected={setSerialConnected} ip={ip} port={port} setIP={setIP}
                            setPort={setPort}/>
                <TelemetryCard telemetry={Telemetry}/>
            </div>
            <Graph socket={socket}/>


        </div>
    );
}

export default App;

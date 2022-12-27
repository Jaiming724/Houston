import React, {useEffect, useState} from 'react';
import io from 'socket.io-client';
import Header from "./components/Header";
import StatusCard from "./components/StatusCard";
import Graph from "./components/Graph";
import TelemetryHeaders from "./components/TelemetryHeaders";
import TelemetryCard from "./components/TelemetryCard";

const socket = io.connect("http://localhost:8080");

function App() {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [isSerialConnected, setSerialConnected] = useState(false);
    const [ping, setPing] = useState(0);
    const [Telemetry, setTelemetry] = useState([])
    const [ip, setIP] = useState("http://localhost:8080")
    const [port, setPort] = useState("COM7")

    const [telemetryHeaders, setTelemetryHeaders] = useState([]);
    const [graphHeaders, setGraphHeaders] = useState([]);
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

            let tempHeader = []
            for (let i = 0; i < tele.length; i++) {

                tempHeader.push(tele[i].split(":")[0])
            }
            setTelemetryHeaders(tempHeader)

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

    function handleChange(event) {
        if (event.target.checked === true) {
            setGraphHeaders([...graphHeaders, event.target.value])
        } else {
            setGraphHeaders(graphHeaders.filter(item => item !== event.target.value))
        }
    }

    return (
        <div>
            <Header ping={ping}/>

            <div className="flex">
                <StatusCard isSocketConnected={isConnected} isSerialConnected={isSerialConnected} socket={socket}
                            setSerialConnected={setSerialConnected} ip={ip} port={port} setIP={setIP}
                            setPort={setPort}/>
                <TelemetryCard telemetry={Telemetry} socket={socket}/>
            </div>
            <Graph socket={socket} graphHeaders={graphHeaders}/>
            <TelemetryHeaders telemetryHeaders={telemetryHeaders} graphHeaders={graphHeaders}
                              handleChange={handleChange}/>
        </div>
    );
}

export default App;

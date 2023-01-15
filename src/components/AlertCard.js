import React, {useEffect, useState} from 'react';
import Card from "./Card";

function AlertCard({socket}) {
    const [alerts, setAlerts] = useState([]);
    useEffect(() => {
        socket.on("alert", (data) => {
            let tele = data.split(";")
            tele.pop()
            setAlerts([...alerts, ...tele])
        })
    });
    return (
        <Card>
            <ul className="h-80 overflow-hidden overflow-y-scroll w-72">
                {alerts.map((ele) => (
                        <li className="text-white text-center">{ele}</li>
                    ))}

            </ul>

        </Card>
    );
}

export default AlertCard;

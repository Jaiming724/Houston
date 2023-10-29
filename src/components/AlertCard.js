import React, {useEffect, useState} from 'react';
import Card from "./Card";
import {Button} from "@mui/material";

function AlertCard({socket}) {
    const [alerts, setAlerts] = useState([]);


    useEffect(() => {
        socket.on("alert", (data) => {
            let tele = data.split(";")

            // tele.pop()

            setAlerts(alerts.concat(tele))

        })
    });
    return (
        <Card>
            <div>
                <div className="h-72 overflow-hidden overflow-y-scroll w-72">
                    <ul>
                        {alerts.map((ele) => (
                            <li className="text-white text-center">{ele}</li>
                        ))}

                    </ul>
                </div>
                <Button className="w-full" variant="contained"
                        onClick={() => setAlerts([])}>Clear
                </Button>
            </div>


        </Card>
    );
}

export default AlertCard;

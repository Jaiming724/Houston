import React from 'react';
import Card from "./Card";
import {Button} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from '@mui/icons-material/Close';

const StatusCard = ({isSocketConnected, isSerialConnected, socket, setSerialConnected, ip, port}) => {
    function changeSerialStatus() {
        if (isSerialConnected) {
            socket.emit("detach");
        } else {
            socket.emit("attach");
        }
        setSerialConnected(!isSerialConnected);
    }

    return (
        <Card>
            <h1 className="text-4xl font-bold text-white">Status</h1>
            <div className="text-white flex items-start">
                <p>Socket Connected:</p>
                <div>
                    {
                        isSocketConnected ? <CheckIcon style={{color: "green"}}/> : <CloseIcon style={{color: "red"}}/>
                    }
                </div>

            </div>
            <div className="text-white flex items-center ">
                <div><p>Serial Connected: </p></div>
                <div>
                    {
                        isSerialConnected ? <CheckIcon style={{color: "green"}}/> : <CloseIcon style={{color: "red"}}/>
                    }
                </div>

            </div>
            <p className="text-white">{ip}</p>
            <p className="text-white">Port: {port}</p>
            <Button color={`${isSerialConnected ? 'error' : 'success'}`} variant="contained"
                    onClick={changeSerialStatus}>{isSerialConnected ? "Detach" : "Attach"}
            </Button>
        </Card>
    );
}

export default StatusCard;

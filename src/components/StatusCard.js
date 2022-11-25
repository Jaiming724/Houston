import React from 'react';
import Card from "./Card";
import {Button, TextField} from "@mui/material";
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
        <Card className="p-3">
            <h1 className="text-4xl font-bold text-white text-left pt-1 pb-3">Status</h1>
            <div className="text-white flex">
                <div><p>Socket Connected:</p></div>
                <div>

                    {
                        isSocketConnected ? <CheckIcon style={{color: "green"}}/> : <CloseIcon style={{color: "red"}}/>
                    }
                </div>

            </div>
            <div className="text-white flex ">
                <div><p>Serial Connected: </p></div>
                <div>
                    {
                        isSerialConnected ? <CheckIcon style={{color: "green"}}/> : <CloseIcon style={{color: "red"}}/>
                    }
                </div>

            </div>
            <div className="py-3 text-white">
                <TextField id="standard-basic" label="IP" variant="standard" defaultValue={ip}
                           sx={{input: {color: 'white'}, label: {color: 'white'}}}/>
            </div>
            <div className="py-3">
                <TextField id="standard-basic" label="Port" variant="standard" defaultValue={port} sx={{input: {color: 'white'}, label: {color: 'white'}}}/>
            </div>
            <div className="text-center">
                <Button className="w-full" color={`${isSerialConnected ? 'error' : 'success'}`} variant="contained"
                        onClick={changeSerialStatus}>{isSerialConnected ? "Detach" : "Attach"}
                </Button>
            </div>
        </Card>
    );
}

export default StatusCard;

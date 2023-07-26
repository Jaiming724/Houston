import {Button, Checkbox, TextField} from "@mui/material";
import Card from "./Card";
import React, {useEffect, useMemo, useRef, useState} from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

export default function ModifyValuesCard({socket}) {
    const [info, setInfo] = useState([]);

    // Declare a map with <key, value>
    const lastValue = useRef(new Map());

    useEffect(() => {
        socket.on("mapData", (data) => {
            let line = data.split(";");
            setInfo(line)

        });
    }, []);

    function handle(key, v) {
        console.log(key, v)
        socket.emit("newValue", {key: key, value: v});
    }

    function handleButton(k, v) {
        console.log(v)
        if (v) {
            socket.emit("newValue", {key: k, value: 2342});

        } else {
            socket.emit("newValue", {key: k, value: 0});

        }

    }

    const card = useMemo(() => (
        <div>
            {info.map((obj) => (
                <div className="flex items-center">
                    <p>{obj}</p>
                    {
                        obj[0] === "B" ?
                            <Checkbox {...{inputProps: {'aria-label': {obj}}}} defaultChecked
                                      onChange={(e) => handle(obj, e.target.checked)}/> :
                            <TextField key={obj.key} id="standard-basic" variant="standard" inputProps={{
                                onKeyUp: (event) => {
                                    if (event.key === "Enter") {
                                        event.stopPropagation();
                                        handle(obj, event.target.value)
                                    }
                                },
                            }}/>
                    }

                </div>
            ))}
        </div>
    ), [info]);
    return (
        <Card className="px-16 text-center">
            <h2>Value Changer</h2>
            {card}
        </Card>
    );
}

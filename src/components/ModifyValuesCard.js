import {TextField} from "@mui/material";
import Card from "./Card";
import {useEffect, useMemo, useRef, useState} from "react";

export default function ModifyValuesCard({socket}) {
    const [info, setInfo] = useState([]);

    // Declare a map with <key, value>
    const lastValue = useRef(new Map());

    useEffect(() => {
        socket.on("mapData", (data) => {
            let line = data.split(";");
            let temp = [];
            for (let i = 0; i < line.length - 1; i++) {
                let k = line[i].split(":")[0];
                let v = line[i].split(":")[1];
                temp.push({key: k, value: v});
            }

            let dirty = false;
            // check if all keys in temp exist in lastValue
            // if not, add it to lastValue
            temp.forEach((obj) => {
                if (!lastValue.current.has(obj.key)) {
                    lastValue.current.set(obj.key, obj.value);
                    dirty = true;
                }
            });

            // check if any values in temp exist in lastValue
            // if not, set lastValue
            temp.forEach((obj) => {
                if (lastValue.current.get(obj.key) !== obj.value) {
                    lastValue.current.set(obj.key, obj.value);
                    dirty = true;
                }
            });

            // only call setInfo when there are changes. if not, dont call
            if (dirty) {
                console.log(temp)
                setInfo(temp);
            }
        });
    }, []);

    function handle(key, v) {
        socket.emit("newValue", {key: key, value: v});
    }

    const card = useMemo(() => (
        <div>
            {info.map((obj) => (
                <div className="flex items-center">
                    <p>{obj.key}</p>
                    <TextField key={obj.key} id="standard-basic" variant="standard" inputProps={{
                        onKeyUp: (event) => {
                            if (event.key === "Enter") {
                                event.stopPropagation();
                                handle(obj.key, event.target.value)
                            }
                        },
                    }}/>
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

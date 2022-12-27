import * as React from 'react';
import {DataGrid} from "@mui/x-data-grid";
import {Button, TextField} from "@mui/material";
import {useEffect, useState} from "react";

const columns = [
    {field: 'id', headerName: 'Name', width: 100},
    {field: 'value', headerName: 'Value', width: 100},

];

export default function TelemetryCard({telemetry, socket}) {
    const [fileName, setFileName] = useState("data.csv")
    const [saveData, setSaveStatus] = useState(false)
    const [fileHeader, setFileHeader] = useState([])

    function changeSaveStatus() {
        if (!saveData) {
            socket.emit("saveStatus", {"status": true, "fileHeader": fileHeader, "fileName": fileName});
        } else {
            socket.emit("saveStatus", {"status": false, "fileHeader": null, "fileName": null});
        }
        setSaveStatus(!saveData);

    }

    const rows = []
    for (let i = 0; i < telemetry.length; i++) {
        rows.push({"id": telemetry[i].split(":")[0], "value": telemetry[i].split(":")[1]})
    }
    return (
        <div className="bg-slate-700 md:min-w-[25%]">
            <DataGrid sx={{color: "white"}} className="h-full"
                      rows={rows}
                      columns={columns}
                      pageSize={10}
                      rowsPerPageOptions={[10]}
                      checkboxSelection
                      onSelectionModelChange={itm => setFileHeader(itm)}
                      autoHeight/>

            <div className="px-1 py-2 flex justify-content">
                <TextField id="standard-basic" label="File Name" variant="standard" defaultValue={fileName}
                           sx={{input: {color: 'white'}, label: {color: 'white'}}}
                           onChange={(e) => {
                               setFileName(e.target.value)
                           }}
                />
                <Button className="mx-auto" color={`${saveData ? 'error' : 'success'}`} variant="contained"
                        onClick={changeSaveStatus}>{saveData ? "Stop" : "Save To File"}
                </Button>
                <Button className="mx-auto" color={`${saveData ? 'error' : 'success'}`} variant="contained"
                        onClick={(e) => console.log(saveData)}>{"testing"}
                </Button>
            </div>
        </div>
    );
}

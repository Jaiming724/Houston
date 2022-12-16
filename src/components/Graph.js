import React, {useState, useMemo, useEffect} from "react";
import {Chart, registerables} from "chart.js";
import StreamingPlugin from "chartjs-plugin-streaming";
import {Line} from "react-chartjs-2";
import "chartjs-adapter-luxon";
import {Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel} from "@mui/material";

Chart.register(...registerables);
Chart.register(StreamingPlugin);

export default function Graph({telemetry}) {
    const [graphTitle, setGraphTitle] = useState([]);

    const MyChart = useMemo(() => (
        <Line
            data={{
                datasets: [
                    {
                        label: "Dataset 1",
                        backgroundColor: "rgbaa(255, 99, 132, 0.5)",
                        borderColor: "rgb(255, 99, 132)",
                        borderDash: [8, 4],
                        fill: true,
                        data: []
                    },
                    {
                        label: "Dataset 2",
                        backgroundColor: "rgba(54, 162, 235, 0.5)",
                        borderColor: "rgb(54, 162, 235)",
                        cubicInterpolationMode: "monotone",
                        fill: true,
                        data: []
                    }
                ]
            }}
            options={{
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: "realtime",
                        realtime: {
                            delay: 1000,
                            onRefresh: (chart) => {
                                // const datasets = chart.data.datasets;
                                // const dsColor = "red"
                                // const newDataset = {
                                //     label: 'Dataset ' + (datasets.length + 1),
                                //     borderColor: dsColor,
                                //     data: []
                                // };
                                // datasets.push(newDataset);
                                // chart.update();


                                chart.data.datasets.forEach((dataset) => {
                                    dataset.data.push({
                                        x: Date.now(),
                                        y: parseInt(telemetry[1].split(":")[1])
                                    });
                                });
                            }
                        }
                    }
                }
            }}
            type="line"/>), []);

    return (
        <div style={{height: '50vh'}} className="bg-slate-700 shadow-lg rounded my-10">
            {MyChart}
            {/*<FormControl component="fieldset">*/}
            {/*    <div className="flex">*/}
            {/*        {telemetry.map((ele) => (*/}
            {/*            <FormControlLabel*/}
            {/*                value="bottom"*/}
            {/*                control={<Checkbox sx={{color: "white"}}/>}*/}
            {/*                label={ele.split(":")[0]}*/}
            {/*                labelPlacement="bottom"*/}
            {/*            />*/}

            {/*        ))}*/}
            {/*    </div>*/}

            {/*</FormControl>*/}
        </div>

    );
}

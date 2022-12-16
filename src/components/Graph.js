import React, {useState} from "react";
import {Chart, registerables} from "chart.js";
import StreamingPlugin from "chartjs-plugin-streaming";
import {Line} from "react-chartjs-2";
import "chartjs-adapter-luxon";
import {Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel} from "@mui/material";

Chart.register(...registerables);
Chart.register(StreamingPlugin);

export default function Graph({telemetry}) {
    const [graphTitle, setGraphTitle] = useState([])
    return (
        <div style={{height: '50vh'}}>


            <Line
                data={{
                    datasets: [
                        {
                            label: "Dataset 1",
                            backgroundColor: "rgba(255, 99, 132, 0.5)",
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
                                delay: 2000,
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
                                            y: Math.random()
                                        });
                                    });
                                }
                            }
                        }
                    }
                }}
                type="line"/>

        </div>

    );
}

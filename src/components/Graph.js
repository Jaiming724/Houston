import React, {useEffect, useMemo} from "react";
import {Chart, registerables} from "chart.js";
import StreamingPlugin from "chartjs-plugin-streaming";
import {Line} from "react-chartjs-2";
import "chartjs-adapter-luxon";

Chart.register(...registerables);
Chart.register(StreamingPlugin);

export default function Graph({socket, graphHeaders}) {
    let telemetryStr = ""
    const map = new Map();
    const colors = ['red', 'blue', 'green', 'purple', 'yellow']

    useEffect(() => {
        socket.on('returnData', (data) => {
            let tele = data["data"].split(";")
            tele.pop()

            map.clear()
            for (let i = 0; i < tele.length; i++) {
                let temp = tele[i].split(":")
                map.set(temp[0], temp[1])
            }
            telemetryStr = tele
        });
    })

    const MyChart = useMemo(() => (
        <Line
            data={{
                datasets: [
                    // {
                    //     label: "HeartBeat",
                    //     backgroundColor: "rgba(54, 162, 235, 0.5)",
                    //     borderColor: "rgb(54, 162, 235)",
                    //     cubicInterpolationMode: "monotone",
                    //     fill: true,
                    //     data: []
                    // }


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
                                const datasets = chart.data.datasets;

                                let existingLabels = []
                                for (let i = 0; i < chart.data.datasets.length; i++) {
                                    existingLabels.push(chart.data.datasets[i].label)
                                }
                                for (let i = 0; i < graphHeaders.length; i++) {
                                    if (!existingLabels.includes(graphHeaders[i])) {
                                        const newDataset = {
                                            label: graphHeaders[i],
                                            borderColor: colors[datasets.length%colors.length],
                                            backgroundColor: colors[datasets.length%colors.length],
                                            cubicInterpolationMode: "monotone",
                                            fill: true,
                                            data: []
                                        };
                                        datasets.push(newDataset);
                                    }
                                }
                                // let idx = -1
                                // for (let i = 0; i < chart.data.datasets.length; i++) {
                                //     if (chart.data.datasets[i].label === "Dataset 2") {
                                //         idx = i
                                //     }
                                // }
                                // if (idx !== -1) {
                                //     chart.data.datasets.splice(idx, 1)
                                // }

                                chart.update()
                                chart.data.datasets.forEach((dataset) => {
                                    dataset.data.push({
                                        x: Date.now(),
                                        y: map.get(dataset.label)
                                    });
                                });
                            }
                        }
                    }
                }
            }}
            type="line"/>), [graphHeaders]);

    return (
        <div style={{height: '50vh'}} className="bg-slate-700 shadow-lg rounded my-10 w-screen">
            {MyChart}

        </div>

    );
}

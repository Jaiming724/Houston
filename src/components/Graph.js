import React, {useEffect, useMemo} from "react";
import {Chart, registerables} from "chart.js";
import StreamingPlugin from "chartjs-plugin-streaming";
import {Line} from "react-chartjs-2";
import "chartjs-adapter-luxon";

Chart.register(...registerables);
Chart.register(StreamingPlugin);

export default function Graph({socket, graphHeaders}) {
    const map = new Map();
    const colors = ['red', 'blue', 'green', 'purple', 'yellow']

    useEffect(() => {
        socket.on('returnData', (data) => {
            let tele = data["data"].split(";")
            tele.pop()
            //console.log(tele)

            map.clear()
            for (let i = 0; i < tele.length; i++) {
                let temp = tele[i].split(":")

                map.set(temp[0], parseFloat(temp[1]))
                //console.log(temp[1])
            }
        });
    },)

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
                                            fill: false,
                                            data: []
                                        };
                                        datasets.push(newDataset);
                                    }
                                }

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

import React, {useState} from 'react';
import Card from "./Card";

function TelemetryCard({telemetry}) {

    return (
        <Card className="md:min-w-[25%]">
            {telemetry.map((ele) => (
                <p className="text-white text-center">{ele}</p>
            ))}
        </Card>
    );
}

export default TelemetryCard;

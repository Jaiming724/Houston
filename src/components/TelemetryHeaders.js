import {Checkbox, FormControl, FormControlLabel} from "@mui/material";

const TelemetryHeaders = ({telemetryHeaders, graphHeaders, handleChange}) => {
    return (

        <FormControl component="fieldset" className="w-full mx-auto ">

            <div className="flex justify-center	">
                {telemetryHeaders.map((ele) => (
                    <FormControlLabel key={ele}
                        value={ele}
                        control={<Checkbox sx={{color: "white"}} onChange={handleChange}
                                           checked={graphHeaders.includes(ele)}/>}
                        label={ele}
                        labelPlacement="bottom"
                    />

                ))}
            </div>

        </FormControl>
    );
}


export default TelemetryHeaders



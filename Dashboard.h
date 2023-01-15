#include "Module.h"
#include "LinearActuator.h"
#include "Hardware.h"
#include "Dashboard.h"

#define VECTOR_SIZE 1
#define starting_voltage 5
#define buck_status_voltage 45
#define PCC_disconnect_voltage 0.5
#define reconnect_voltage 1
enum Status {
    stop, looping, startup
};

void sendTransmission();

const char *getStatus();

Module *modules[VECTOR_SIZE];
Status status = startup;

int num = 0;
float num2 = 1.344525;

bool isEStop = false;
void setup() {
    HardwareUtil::setup();
    LinearActuator linearActuator("LinearActuator", 100);
    Serial.begin(9600);

    modules[0] = &linearActuator;
}

void loop() {

    Dashboard::telemetry("Status", getStatus());
    Dashboard::telemetry("HeartBeat", num);
    Dashboard::telemetry("HeartBeat2", num2,3);



    num += 1;
    num2 += 1.0;
    if(num%5==0){
      Dashboard::alert("Num is muliple of 5");
    }
    if (status == startup) {
        HardwareUtil::set_lpf_switch(false);
        isEStop = false;
        for (int i = 0; i < VECTOR_SIZE; i++) {
            modules[i]->start();
        }
        if (HardwareUtil::getGeneratorVoltage() < starting_voltage) {
            status = looping;
            HardwareUtil::set_lpf_switch(true);
            HardwareUtil::set_buck_switch(false);
        }
    } else if (status == looping) {

        for (int i = 0; i < VECTOR_SIZE; i++) {
            modules[i]->loop();
        }
        if (HardwareUtil::getLoadVoltage() >= buck_status_voltage) {
            HardwareUtil::set_buck_switch(true);
        }
        //If load voltage is less than 0.5 and we are still generating power, then we know there is a PCC Disconnect
        // Once we detect a PCC disconnect, we turn back the LPF switch to get power from the wall and move to stop mode
        if (HardwareUtil::getLoadVoltage() <= PCC_disconnect_voltage && HardwareUtil::getGeneratorVoltage() > starting_voltage) {
            HardwareUtil::set_lpf_switch(false);
            status = stop;
        }
        if (HardwareUtil::isEstopPressed()) {
            status = stop;
            isEStop = true;
        }
    } else {
        for (int i = 0; i < VECTOR_SIZE; i++) {
            modules[i]->stop();
        }
        if (isEStop) {
            if (!HardwareUtil::isEstopPressed()) {
                status = startup;
                isEStop = false;
            }
        } else {
            //Once the turbine generates more than 1, we know there is no longer a disconect
            //Then we can move back to startup sequence
            if (HardwareUtil::getTurbineOutputVoltage() >= reconnect_voltage) {
                status = startup;
            }
        }

    }
  Dashboard::send();
}


void sendTransmission() {
    Serial.print(
            "T" + String(HardwareUtil::getWindSpeedVal()) + "," + String(HardwareUtil::getGeneratorVoltage()) + "," +
            String(HardwareUtil::getLoadVoltage())
            + "," + String(HardwareUtil::getTurbineOutputVoltage()) + "\n");
}

const char *getStatus() {
    if (status == startup) {
        return "startup";
    } else if (status == looping) {
        return "looping";
    } else if (status == stop) {
        return "stop";
    } else {
        return "UNKNOWN_STATUS";
    }
}
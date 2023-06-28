#pragma once

#include <Arduino.h>

#define buffer_size 400
#define mapSize 3
#define mapBufferSize 100
#define alertBufferSize 50
#define numBufferSize 12
#define floatBufferSize 20
#define inputBufferSize 5

class Dashboard {


public:
    char buffer[buffer_size] = {0};
    char alertBuffer[alertBufferSize] = {0};
    char numBuffer[numBufferSize] = {0};
    char floatBuffer[floatBufferSize] = {0};

    char mapKeys[mapSize][15] = {0};
    int *mapValues[mapSize] = {0};
    char mapKeysBuffer[mapBufferSize] = {0};
    char inputBuffer[inputBufferSize] = {0};
    bool receivedData = false;
    int inputPos = 0;

    Dashboard() {
        memset(buffer, 0, buffer_size);
        memset(alertBuffer, 0, alertBufferSize);
        memset(mapKeysBuffer, 0, mapBufferSize);
        strcat(buffer, "CWC!");
        strcat(alertBuffer, "CWCA!");
        strcat(mapKeysBuffer, "CWCM");
    }

    bool (*callback)();

    void alert(const char *s) {
        if (strlen(alertBuffer) + strlen(s) >= 50) {
            memset(alertBuffer, 0, 50);
            strcat(buffer, "ERROR:TOO MUCH DATA;");
        } else {
            strcat(alertBuffer, s);
            strcat(alertBuffer, ";");
        }
    }

    void integer_to_string(int x) {
        sprintf(numBuffer, "%d", x);
    }

    void float_to_string(float x, int precision) {
        dtostrf(x, -1, precision, floatBuffer);
    }

    void telemetry(const char *s, const char *t) {
        if (strlen(s) + strlen(t) + strlen(buffer) >= buffer_size) {
            memset(buffer, 0, buffer_size);
            strcat(buffer, "ERROR:TOO MUCH DATA;");
            send();
        } else {
            strcat(buffer, s);
            strcat(buffer, ":");
            strcat(buffer, t);
            strcat(buffer, ";");
        }
    }

    void telemetry(const char *s, int t) {
        if (t > 32767 || t < -32768) {
            telemetry(s, "NUMBER OUT OF RANGE");
        } else {
            integer_to_string(t);
            telemetry(s, numBuffer);
            memset(numBuffer, 0, numBufferSize);
        }
    }

    void telemetry(const char *s, float t, int precision) {
        int currentFloatBufferSize = 1 + log10(abs(t)) + 1 + precision + 1;
        if (currentFloatBufferSize > floatBufferSize) {
            telemetry(s, "NUMBER OUT OF RANGE");
            return;
        }
        float_to_string(t, precision);
        telemetry(s, floatBuffer);
        memset(floatBuffer, 0, floatBufferSize);
    }

    //    void changeValue(const char *ptr, float value) {
    //        for (int i = 0; i < mapSize; i++) {
    //            if (strcmp(ptr, mapKeys[i])) {
    //                *(mapValues[i]) = value;
    //                return;
    //            }
    //        }
    //    }

    void send() {

        while (Serial.available() > 0) {
            receivedData = true;
            char temp = Serial.read();
            inputBuffer[inputPos] = temp;
            inputPos++;
        }

        if (receivedData) {

            uint16_t result = ((uint8_t) inputBuffer[0] << 8) | (uint8_t) inputBuffer[1];

            memset(inputBuffer, 0, inputBufferSize);
            if(result>500){
                *mapValues[2] = result - 500;

            }else if (result > 200) {
                *mapValues[1] = result - 200;
            } else {
                *mapValues[0] = result;
            }
            receivedData = false;
            inputPos = 0;

        }

        // while (Serial.available()>0) {
        //     int pitch = Serial.parseInt();
        //     if (pitch != NULL) {
        //         if(pitch>200){
        //           *mapValues[1] = pitch-200;

        //         }else{
        //         *mapValues[0] = pitch;
        //               *mapValues[1] = pitch;

        //         }
        //     }
        // }


        for (int i = 0; i < mapSize; i++) {
            strcat(mapKeysBuffer, mapKeys[i]);
            strcat(mapKeysBuffer, ":");
            integer_to_string(*(mapValues[i]));
            strcat(mapKeysBuffer, numBuffer);
            memset(numBuffer, 0, numBufferSize);
            strcat(mapKeysBuffer, ";");
        }
        Serial.println(buffer);
        Serial.println(alertBuffer);
        Serial.println(mapKeysBuffer);
        memset(buffer, 0, buffer_size);
        memset(alertBuffer, 0, 50);
        memset(mapKeysBuffer, 0, mapBufferSize);
        strcat(buffer, "CWC!");
        strcat(alertBuffer, "CWCA!");
        strcat(mapKeysBuffer, "CWCM!");
    }
};

inline Dashboard dashboard;

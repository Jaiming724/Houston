#pragma once

#include <Arduino.h>

class Dashboard {


public:
    static char buffer[100];
    static char alertBuffer[50];
    static char numBuffer[12];
    static char floatBuffer[20];

    bool (*callback)();

    static void alert(const char *s) {
        if (strlen(alertBuffer)+strlen(s) >= 50){
            memset(alertBuffer, 0, 50);
            strcat(buffer, "ERROR:TOO MUCH DATA;");
        }else{
            strcat(alertBuffer, s);
            strcat(alertBuffer,";");
        }

    }

    static void integer_to_string(int x) {
        sprintf(numBuffer, "%d", x);
    }

    static void float_to_string(float x, int precision) {
        dtostrf(x, -1, precision, floatBuffer);
    }

    static void telemetry(const char *s, const char *t) {
        if (strlen(s) + strlen(t) + strlen(buffer) >= 100) {
            memset(buffer, 0, 100);
            strcat(buffer, "ERROR:TOO MUCH DATA;");
            send();
        } else {
            strcat(buffer, s);
            strcat(buffer, ":");
            strcat(buffer, t);
            strcat(buffer, ";");
        }
    }

    static void telemetry(const char *s, int t) {
        if (t > 32767 || t < -32768) {
            telemetry(s, "NUMBER OUT OF RANGE");
        } else {
            integer_to_string(t);
            telemetry(s, numBuffer);
        }
    }

    static void telemetry(const char *s, float t, int precision) {
        int floatBufferSize = 1 + log10(abs(t)) + 1 + precision + 1;
        if (floatBufferSize > 20) {
            telemetry(s, "NUMBER OUT OF RANGE");
            return;
        }
        float_to_string(t, precision);
        telemetry(s, floatBuffer);
    }

    static void send() {


        Serial.println(buffer);
        Serial.println(alertBuffer);
        memset(buffer, 0, 100);
        memset(alertBuffer, 0, 50);
        strcat(buffer, "CWC!");
        strcat(alertBuffer, "CWCA!");
    }
};

char Dashboard::buffer[] = "CWC!";
char Dashboard::alertBuffer[] = "CWCA!";
char Dashboard::numBuffer[] = {0};
char Dashboard::floatBuffer[] = {0};

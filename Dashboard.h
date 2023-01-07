#pragma once

#include <Arduino.h>

class Dashboard {


public:
    static char buffer[100];
    static char numBuffer[12];
    static char floatBuffer[20];

    static void integer_to_string(int x) {
        sprintf(numBuffer, "%d", x);
    }

    static void float_to_string(float x, int precision) {
        dtostrf(x, -1, precision, floatBuffer);
    }

    static void telemetry(const char *s, const char *t) {
        strcat(buffer, s);
        strcat(buffer, ":");
        strcat(buffer, t);
        strcat(buffer, ";");
        if (strlen(buffer) >= 100) {
            memset(buffer, 0, sizeof(buffer));
            strcat(buffer, "ERROR:TOO MUCH DATA;");
            send();
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
        memset(buffer, 0, sizeof(buffer));
        strcat(buffer,"CWC!");

    }

};

char Dashboard::buffer[] = "CWC!";
char Dashboard::numBuffer[] = {0};
char Dashboard::floatBuffer[] = {0};


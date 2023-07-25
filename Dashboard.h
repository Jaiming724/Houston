#pragma once

#include <Arduino.h>

#define buffer_size 400
#define mapSize 3
#define mapBufferSize 100
#define alertBufferSize 100
#define numBufferSize 12
#define floatBufferSize 20
#define inputBufferSize 5
struct Packet {
    uint8_t packet_id;
    uint16_t packet_length;
    char data_buf[16];
    union {
        float float_data;
        //Questionable, technically the server can send a 4 byte integer
        int int_data;
    };
    uint32_t checksum;
};
enum DataState {
    IDLE,
    HEADER_RECEIVED,
    SIZE_RECEIVED,
    STRING_DATA_RECEIVED,
    NUMERIC_DATA_RECEIVED,
    CHECKSUM_RECEIVED
};

class Dashboard {
private:
    uint32_t crc32(const char *s, size_t n) {
        uint32_t crc = 0xFFFFFFFF;

        for (size_t i = 0; i < n; i++) {
            char ch = s[i];
            for (size_t j = 0; j < 8; j++) {
                uint32_t b = (ch ^ crc) & 1;
                crc >>= 1;
                if (b) crc = crc ^ 0xEDB88320;
                ch >>= 1;
            }
        }

        return ~crc;
    }

public:
    struct Packet received_packet;
    DataState dataState = IDLE;

    char buffer[buffer_size] = {0};
    char alertBuffer[alertBufferSize] = {0};
    char numBuffer[numBufferSize] = {0};
    char floatBuffer[floatBufferSize] = {0};

    char mapKeys[mapSize][15] = {{0}};
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
        if (strlen(alertBuffer) + strlen(s) >= alertBufferSize) {
            memset(alertBuffer, 0, alertBufferSize);
            strcat(alertBuffer, "ERROR:TOO MUCH DATA;");
        } else {
            strcat(alertBuffer, s);
            strcat(alertBuffer, ";");
        }
    }

    void alert(int num) {
        integer_to_string(num);
        alert(numBuffer);
        memset(numBuffer, 0, numBufferSize);
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

    void resetPacket() {
        received_packet.packet_id = 0;
        received_packet.packet_length = 0;
        received_packet.checksum = 0;
        memset(received_packet.data_buf, 0, 16);
    }

    void processData() {
        if (dataState == IDLE) {
            resetPacket();
            if (Serial.available() > 0) {
                uint8_t temp = Serial.read();
                if (temp == 13) {
                    received_packet.packet_id = temp;
                    dataState = HEADER_RECEIVED;
                }
            }
        } else if (dataState == HEADER_RECEIVED) {
            if (Serial.available() >= 2) {
                uint8_t least = Serial.read();
                uint8_t most = Serial.read();
                uint16_t res = most << 8 | least;
                if (res >= 15) {
                    dataState = IDLE;
                    alert("size corruption");
                } else {
                    received_packet.packet_length = res;
                    dataState = SIZE_RECEIVED;
                    //alert("Receive size");
                }
            }
        } else if (dataState == SIZE_RECEIVED) {
            if (Serial.available() >= received_packet.packet_length) {
                for (uint16_t i = 0; i < received_packet.packet_length; i++) {
                    received_packet.data_buf[i] = Serial.read();
                }
                dataState = STRING_DATA_RECEIVED;
            }
        } else if (dataState == STRING_DATA_RECEIVED) {
            if (Serial.available() >= 4) {
                for (uint8_t i = 0; i < 4; i++) {
                    received_packet.data_buf[received_packet.packet_length + i] = Serial.read();
                }
                float f;
                memcpy(&f, received_packet.data_buf + received_packet.packet_length, 4);
                received_packet.float_data = f;
                dataState = NUMERIC_DATA_RECEIVED;
            }
        } else if (dataState == NUMERIC_DATA_RECEIVED) {
            if (Serial.available() >= 4) {
                uint32_t result = 0;
                for (uint8_t i = 0; i < 4; i++) {
                    uint8_t t = Serial.read();
                    result |= ((uint32_t) t) << i * 8;
                }
                uint32_t calcCRC32 = crc32(received_packet.data_buf, received_packet.packet_length + 4);
                if (calcCRC32 == result) {
                    received_packet.checksum = result;
                    dataState = CHECKSUM_RECEIVED;
                    alert("checksum passed");

                } else {
                    alert("checksum failed");
                    dataState = IDLE;
                }

            }
        }
        if (dataState == CHECKSUM_RECEIVED) {
            alert(received_packet.packet_id);
            alert(received_packet.packet_length);
            alert(received_packet.data_buf);
            alert(received_packet.checksum);
            dataState = IDLE;
        }

    }

    void send() {
        processData();

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

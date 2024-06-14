#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>
#include <Wire.h>


#define MY_I2C_ADDRESS 8

#define RST_PIN_1 9
#define CS_PIN_1 8


MFRC522 mfrc522_1(CS_PIN_1, RST_PIN_1);

unsigned long previousMillis = 0;

const long interval = 500; 
const long presenceThreshold = 1500; // Time threshold for presence detection
const int maxNoCardCount = 8; // Maximum "No card present" count

unsigned long lastDetectedTime;
bool isPresent;
int noCardCount;

void setup() {
  Wire.begin(MY_I2C_ADDRESS);
  Wire.onRequest(requestEvent);

  mfrc522_1.PCD_Init();
}

void requestEvent() {
  // int value = analogRead(SENSOR_PIN);
  // char charValue = map(value, 0, 1023, 0, 255);
  // Wire.write(charValue);

  unsigned long currentMillis = millis();
  // char charValue;
  bool cardDetected = mfrc522_1.PICC_IsNewCardPresent() &&  mfrc522_1.PICC_ReadCardSerial();

  if (!cardDetected) {
    cardDetected = mfrc522_1.PICC_IsNewCardPresent() && mfrc522_1.PICC_ReadCardSerial(); 
    }

  if (cardDetected) {
    String uidStr = "";
    for (byte i = 0; i < mfrc522_1.uid.size; i++) {
      uidStr += String(mfrc522_1.uid.uidByte[i] < 0x10 ? " 0" : " ");
      uidStr += String(mfrc522_1.uid.uidByte[i], HEX);
    }
    // lastDetectedTime = currentMillis;
    // isPresent = true;
    // noCardCount = 0; // Reset no card count

    char charValue = 1;
    Wire.write(charValue);
  } else {
      noCardCount++;
      // charValue = "0";
    // if (noCardCount >= maxNoCardCount) {
    //   if (currentMillis - lastDetectedTime > presenceThreshold) {
    //     isPresent = false;
    //   }
    char charValue = 0;
    Wire.write(charValue);
    // } else {
    //   charValue = "1";
    // }
  }

  // char charValue = map(value, 0, 1023, 0, 255);
  // Wire.write(charValue);
    }




void loop() {
    }


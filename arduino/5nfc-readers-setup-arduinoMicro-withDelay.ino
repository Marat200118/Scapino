#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>

// Reader 1
#define RST_PIN_1 8
#define CS_PIN_1 10 

// Reader 2
#define RST_PIN_2 9
#define CS_PIN_2 7

// Reader 3
#define RST_PIN_3 6
#define CS_PIN_3 5

// Reader 4
#define RST_PIN_4 4
#define CS_PIN_4 3

// Reader 5
#define RST_PIN_5 A0
#define CS_PIN_5 2

MFRC522 mfrc522_1(CS_PIN_1, RST_PIN_1);
MFRC522 mfrc522_2(CS_PIN_2, RST_PIN_2);
MFRC522 mfrc522_3(CS_PIN_3, RST_PIN_3);
MFRC522 mfrc522_4(CS_PIN_4, RST_PIN_4);
MFRC522 mfrc522_5(CS_PIN_5, RST_PIN_5);

// Timing variables
unsigned long previousMillis1 = 0;
unsigned long previousMillis2 = 0;
unsigned long previousMillis3 = 0;
unsigned long previousMillis4 = 0;
unsigned long previousMillis5 = 0;

const long interval = 500; 

void setup() {
  Serial.begin(9600);
  while (!Serial); 
  Serial.println("Initializing...");

  SPI.begin();
  Serial.println("SPI bus initialized.");

  mfrc522_1.PCD_Init();
  mfrc522_2.PCD_Init();
  mfrc522_3.PCD_Init();
  mfrc522_4.PCD_Init();
  mfrc522_5.PCD_Init();
  Serial.println("RFID readers initialized.");
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis1 >= interval) {
    previousMillis1 = currentMillis;
    checkReader(mfrc522_1, "Reader 1");
  }
  
  if (currentMillis - previousMillis2 >= interval) {
    previousMillis2 = currentMillis;
    checkReader(mfrc522_2, "Reader 2");
  }

  if (currentMillis - previousMillis3 >= interval) {
    previousMillis3 = currentMillis;
    checkReader(mfrc522_3, "Reader 3");
  }

  if (currentMillis - previousMillis4 >= interval) {
    previousMillis4 = currentMillis;
    checkReader(mfrc522_4, "Reader 4");
  }

  if (currentMillis - previousMillis5 >= interval) {
    previousMillis5 = currentMillis;
    checkReader(mfrc522_5, "Reader 5");
  }
}

void checkReader(MFRC522 &reader, const char *readerName) {
  DynamicJsonDocument nfcDoc(1024);

  bool cardDetected = reader.PICC_IsNewCardPresent() && reader.PICC_ReadCardSerial();

  if (cardDetected) {
    String uidStr = "";
    for (byte i = 0; i < reader.uid.size; i++) {
      uidStr += String(reader.uid.uidByte[i] < 0x10 ? " 0" : " ");
      uidStr += String(reader.uid.uidByte[i], HEX);
    }
    nfcDoc["reader"] = readerName;
    nfcDoc["UID"] = uidStr;
  } else {
    nfcDoc["reader"] = readerName;
    nfcDoc["UID"] = "No card present";
  }

  serializeJson(nfcDoc, Serial);
  Serial.println();
}

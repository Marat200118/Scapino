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


MFRC522 mfrc522_1(CS_PIN_1, RST_PIN_1);
MFRC522 mfrc522_2(CS_PIN_2, RST_PIN_2);
MFRC522 mfrc522_3(CS_PIN_3, RST_PIN_3);

void setup() {
  Serial.begin(9600);
  while (!Serial); 
  Serial.println("Initializing...");

  SPI.begin();
  Serial.println("SPI bus initialized.");

  mfrc522_1.PCD_Init();
  mfrc522_2.PCD_Init();
  mfrc522_3.PCD_Init();
  Serial.println("RFID readers initialized.");
}

void loop() {
  checkReader(mfrc522_1, "Reader 1");
  checkReader(mfrc522_2, "Reader 2");
  checkReader(mfrc522_3, "Reader 3");
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

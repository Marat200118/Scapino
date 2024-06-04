#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN 9 
#define CS_PIN 10  

MFRC522 mfrc522(CS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  Serial.println("Initializing...");

  SPI.begin();

  mfrc522.PCD_Init();

  Serial.println("RFID reader initialized.");
}

void loop() {
  // Serial.println("Checking for cards...");
  DynamicJsonDocument nfcDoc(1024);

  // Check if a new card is present
  if (mfrc522.PICC_IsNewCardPresent()) {
    nfcDoc["message"] = "New card detected.";
    // Serial.println("New card detected.");
    if (mfrc522.PICC_ReadCardSerial()) {
      Serial.print("Card UID:");
      for (byte i = 0; i < mfrc522.uid.size; i++) {
        nfcDoc["data"][0] = mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ";
        nfcDoc["data"][1] = mfrc522.uid.uidByte[i], HEX;
        // Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
        // Serial.print(mfrc522.uid.uidByte[i], HEX);
      }
      serializeJson(nfcDoc, Serial);
      Serial.println();
      mfrc522.PICC_HaltA();  // Halt further communication with the card
    } else {
      Serial.println("Failed to read card.");
    }
  } else {
    Serial.println("No card present.");
  }

  delay(100);  // Add a delay to avoid flooding the serial monitor
}

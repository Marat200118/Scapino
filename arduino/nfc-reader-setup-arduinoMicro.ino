#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN 9   // Reset pin
#define CS_PIN 10   // Chip Select (SDA) pin

// Create an instance of the MFRC522 class
MFRC522 mfrc522(CS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  while (!Serial);
  Serial.println("Arduino Micro is working!");
  Serial.println("Initializing...");

  SPI.begin();
  Serial.println("SPI bus initialized.");

  mfrc522.PCD_Init();

  Serial.println("Performing self-test...");
  if (!mfrc522.PCD_PerformSelfTest()) {
    Serial.println("ERROR: RFID reader not connected or failed self-test!");
    while (true); 
  }

  Serial.println("RFID reader initialized and passed self-test.");
}

void loop() {
  Serial.println("Checking for cards...");

  if (!mfrc522.PICC_IsNewCardPresent()) {
    Serial.println("No card detected.");
    delay(1000);
    return;
  }

  Serial.println("New card detected.");

  if (!mfrc522.PICC_ReadCardSerial()) {
    Serial.println("Failed to read card.");
    delay(1000);
    return;
  }

  Serial.print("Card UID:");
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
    Serial.print(mfrc522.uid.uidByte[i], HEX);
  }
  Serial.println();

  // Print the type of the card
  MFRC522::PICC_Type piccType = mfrc522.PICC_GetType(mfrc522.uid.sak);
  Serial.print("PICC type: ");
  Serial.println(mfrc522.PICC_GetTypeName(piccType));

  // Halt PICC
  mfrc522.PICC_HaltA();

  // Stop encryption on PCD
  mfrc522.PCD_StopCrypto1();

  delay(1000);  // Add a delay to avoid flooding the serial monitor
}

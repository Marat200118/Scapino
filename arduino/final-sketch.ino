#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>
#include <FastLED.h>

// Reader pins
#define RST_PIN_1 8
#define CS_PIN_1 10 
#define RST_PIN_2 9
#define CS_PIN_2 7
#define RST_PIN_3 6
#define CS_PIN_3 5
#define RST_PIN_4 4
#define CS_PIN_4 3
#define RST_PIN_5 A0
#define CS_PIN_5 2

MFRC522 mfrc522_1(CS_PIN_1, RST_PIN_1);
MFRC522 mfrc522_2(CS_PIN_2, RST_PIN_2);
MFRC522 mfrc522_3(CS_PIN_3, RST_PIN_3);
MFRC522 mfrc522_4(CS_PIN_4, RST_PIN_4);
MFRC522 mfrc522_5(CS_PIN_5, RST_PIN_5);

// LED ring configuration
#define DATA_PIN A1
#define NUM_LEDS_PER_RING 12
#define NUM_RINGS 5
#define NUM_LEDS (NUM_LEDS_PER_RING * NUM_RINGS)
CRGB leds[NUM_LEDS];

// Timing variables
unsigned long previousMillis1 = 0;
unsigned long previousMillis2 = 0;
unsigned long previousMillis3 = 0;
unsigned long previousMillis4 = 0;
unsigned long previousMillis5 = 0;

const long interval = 500; 
const long presenceThreshold = 1500; // Time threshold for presence detection
const int maxNoCardCount = 8; // Maximum "No card present" count

// State tracking variables
struct ReaderState {
  unsigned long lastDetectedTime;
  bool isPresent;
  int noCardCount;
};

ReaderState readerStates[NUM_RINGS];

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

  FastLED.addLeds<WS2812, DATA_PIN, GRB>(leds, NUM_LEDS);
  FastLED.clear();
  FastLED.show();
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis1 >= interval) {
    previousMillis1 = currentMillis;
    checkReader(mfrc522_1, "Reader 1", 4);
  }
  
  if (currentMillis - previousMillis2 >= interval) {
    previousMillis2 = currentMillis;
    checkReader(mfrc522_2, "Reader 2", 0);
  }

  if (currentMillis - previousMillis3 >= interval) {
    previousMillis3 = currentMillis;
    checkReader(mfrc522_3, "Reader 3", 1);
  }

  if (currentMillis - previousMillis4 >= interval) {
    previousMillis4 = currentMillis;
    checkReader(mfrc522_4, "Reader 4", 2);
  }

  if (currentMillis - previousMillis5 >= interval) {
    previousMillis5 = currentMillis;
    checkReader(mfrc522_5, "Reader 5", 3);
  }
}

void checkReader(MFRC522 &reader, const char *readerName, int ringIndex) {
  DynamicJsonDocument nfcDoc(1024);
  unsigned long currentMillis = millis();

  bool cardDetected = reader.PICC_IsNewCardPresent() && reader.PICC_ReadCardSerial();

  if (!cardDetected) {
    cardDetected = reader.PICC_IsNewCardPresent() && reader.PICC_ReadCardSerial(); }

  if (cardDetected) {
    String uidStr = "";
    for (byte i = 0; i < reader.uid.size; i++) {
      uidStr += String(reader.uid.uidByte[i] < 0x10 ? " 0" : " ");
      uidStr += String(reader.uid.uidByte[i], HEX);
    }

    readerStates[ringIndex].lastDetectedTime = currentMillis;
    readerStates[ringIndex].isPresent = true;
    readerStates[ringIndex].noCardCount = 0; // Reset no card count

    nfcDoc["reader"] = readerName;
    nfcDoc["UID"] = uidStr;

    // Turn on the LED ring corresponding to the reader
    setRingColor(ringIndex, 0, 20, 0);
  } else {
    readerStates[ringIndex].noCardCount++;
    
    if (readerStates[ringIndex].noCardCount >= maxNoCardCount) {
      if (currentMillis - readerStates[ringIndex].lastDetectedTime > presenceThreshold) {
        readerStates[ringIndex].isPresent = false;
      }

      nfcDoc["reader"] = readerName;
      nfcDoc["UID"] = "No card present";

      // Update LED ring based on presence state
      setRingColor(ringIndex, 20, 0, 0);
    } else {
      nfcDoc["reader"] = readerName;
      nfcDoc["UID"] = "Card previously present";
    }
  }

  serializeJson(nfcDoc, Serial);
  Serial.println();
}

void setRingColor(int ringIndex, int red, int green, int blue) {
  int startIndex = ringIndex * NUM_LEDS_PER_RING;
  int endIndex = startIndex + NUM_LEDS_PER_RING;
  for (int i = startIndex; i < endIndex; i++) {
    leds[i] = CRGB(red, green, blue);
  }
  FastLED.show();
}
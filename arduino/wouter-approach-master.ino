#include <Wire.h>

void setup() {
  Wire.begin();        // join i2c bus (address optional for master)
  Serial.begin(9600);  // start serial for output
}

void loop() {

  readPeripheral(8); // read peripheral device #8
  // readPeripheral(9); // read peripheral device #9
  // readPeripheral(10); // read peripheral device #10
  readPeripheral(11); // read peripheral device #11

  delay(100);
}

void readPeripheral(int nr) {
  Wire.requestFrom(nr, 1);
  while (Wire.available()) {
    byte charValue = Wire.read();
    Serial.print(nr);
    Serial.print(": ");
    Serial.println(charValue);
  }
}

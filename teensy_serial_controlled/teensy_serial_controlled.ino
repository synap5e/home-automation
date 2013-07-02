#define PINB_INMASK 7
#ifndef cbi
#define cbi(sfr, bit) (_SFR_BYTE(sfr) &= ~_BV(bit))
#endif
#ifndef sbi
#define sbi(sfr, bit) (_SFR_BYTE(sfr) |= _BV(bit))
#endif

// This line defines a "Uart" object to access the serial port
HardwareSerial Uart = HardwareSerial();

void setup() {
  Serial.begin(9600);
  Serial.println("Start");
  Uart.begin(115200);
  DDRF = 0xFF; // PORTF is used as digital out
  DDRB = (1<<5) | (1<<6); // PIN_B5 and PIN_B6 are OC1A and OC1B (pwm), B0-B3 are digital inputs

}

void loop() {
  uint8_t incomingByte;
  if (Uart.available() > 0) {
    incomingByte = Uart.read();
    Serial.print("Recieved: ");
    Serial.print(incomingByte, HEX);
    Serial.println();
    switch(incomingByte){
    case 0x10: 
      { // SET PORTF: digital out on pins F0 - F7
        uint8_t val = Uart.read();
        Serial.print("Set PORTF = ");
        Serial.println(val, BIN);
        PORTF = val;
        break;
      }
    case 0x11: 
      { // SET OC1A: PWM on B5
        uint8_t val = Uart.read();
        Serial.print("Set OC1A = ");
        Serial.println(val, DEC);
        OCR1A = val;
        sbi(TCCR1A, COM1A1);
        break;
      }
    case 0x12: 
      { // SET OC1B: PWM on B6
        uint8_t val = Uart.read();
        Serial.print("Set OC1B = ");
        Serial.println(val, DEC);
        OCR1B = val;
        sbi(TCCR1A, COM1B1);
        break;
      }
    case 0x20: 
      { // READ PINB (bits 0-3)
        uint8_t ret = PINB & PINB_INMASK;
        Serial.print("Read PINB (bits 0-3) = ");
        Serial.println(ret, BIN);
        Uart.write(ret);
        break;
      }
    case 0x21: 
      { // READ ADC8: ADC on D4
        readADC(A11);
        break;
      }
    case 0x22: 
      { // READ ADC9: ADC on D6
        readADC(A10);
        break;
      }
    case 0x23: 
      { // READ ADC10: ADC on D7
        readADC(A9);
        break;
      }
    case 0x24: 
      { // READ ADC11: ADC on B4
        readADC(A8);
        break;
      }
    default: 
      {
        Serial.println("Unknown command");
        break;
      }
    }
    Serial.println();
  }

}


void readADC(uint8_t pin){
  int ret = analogRead(pin);
  uint8_t low = (ret & 0xFF);
  uint8_t high =(ret >> 8); 
  Serial.print("Read ADC (ADC on ");
  Serial.print(pin, DEC);
  Serial.print(") = ");
  Serial.println(ret, DEC);
  Uart.write(low);
  Uart.write(high);
}




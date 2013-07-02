import serial, time
s = serial.Serial('/dev/ttyATH0', 115200)

# digital write
s.write('\x10\xff')
s.write('\x10\x00')

# digital read
s.write('\x20')
bin(int(s.read().encode('hex'), 16))

# analoug read
s.write('\x24')
int(s.read().encode('hex'), 16) | (int(s.read().encode('hex'), 16)<<8)




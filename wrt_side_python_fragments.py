import serial, time
s = serial.Serial('/dev/ttyATH0', 115200, timeout=0.5)

# digital write
s.write('\x10\xff')
s.write('\x10\x00')

# digital read
s.write('\x20')
bin(int(s.read().encode('hex'), 16))

# analog read
s.write('\x24')
int(s.read().encode('hex'), 16) | (int(s.read().encode('hex'), 16)<<8)



while 1:
	s.write('\x24')
	int(s.read().encode('hex'), 16) | (int(s.read().encode('hex'), 16)<<8)	
	time.sleep(0.1)


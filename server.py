#!/usr/bin/env python

HOST_NAME = "0.0.0.0"
PORT_NUMBER = 8082	
REAL_SERIAL = False
SAMPLE_PERIOD = 15 # store in history once every 15 minutes
UPDATE_PERIOD = 1 # set heater once every minute
t = None

import pickledb
db = pickledb.load('data.db', False)

if REAL_SERIAL:
	import serial
	wrt_ser = serial.Serial('/dev/ttyATH0', 115200, timeout=0.5)
else:
	wrt_ser = file('tmp.serial', 'wc')

import time, collections, os, datetime

def get_day():
	''' Return the number of days from the epoch '''
	return (datetime.datetime.today() - datetime.datetime.utcfromtimestamp(0)).days

def get_time():
	''' Return the number of minutes from 0:00 divied by SAMPLE_PERIOD '''
	tt = datetime.datetime.now().timetuple()
	return (tt[3] * 60 + tt[4])/SAMPLE_PERIOD

def read_temperature():
	print "Reading temperature"
	try:
		time.sleep(5)
	except KeyboardInterrupt:
		pass
	return 17
	
def turn_heater_on(on):
	if on:
		pass
	else:
		pass

def set_heater():
	print "Setting heater"
	if db.get('mode') == 'target':
		if db.get('last_reading') < db.get('target'):
			print "Turning on heater"
			db.set('heater_on', True)
			turn_heater_on(True)
		else:
			print "Turning off heater"
			db.set('heater_on', False)
			turn_heater_on(False)
	elif db.get('mode') == 'off':
		print "Turning off heater"
		db.set('heater_on', False)
		turn_heater_on(False)	
	elif db.get('mode') == 'on':
		print "Turning on heater"
		db.set('heater_on', True)
		turn_heater_on(True)
	else:
		print "Turning off heater"
		db.set('heater_on', False)
		turn_heater_on(False)	

import threading
from apscheduler.scheduler import Scheduler

sched = Scheduler()

@sched.interval_schedule(minutes=UPDATE_PERIOD)
def take_reading():
	day = str(get_day());
	data = db.get(day)
	if data == None:
		data = [0] * (24*60/SAMPLE_PERIOD)
	time = get_time()
	temp = read_temperature()
	if data[time] == 0:
		data[time] = temp
		db.set(day, data)
		db.set('last_reading', temp)
	set_heater()

@sched.interval_schedule(minutes=1)
def countdown():
	rem = db.get('minutes_remaining')
	if rem < 10**6:
		

if db.get('mode') == None:
	db.set('mode', 'off')
	db.set('heater_on', False)
	db.set('target', 12.0)
	db.set('minutes_remaining', 10**6)
	print "Setting up database"

sched.start()
t = threading.Thread(target=take_reading)
t.start()

import BaseHTTPServer, SimpleHTTPServer, json, urlparse
class MyHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
	super = SimpleHTTPServer.SimpleHTTPRequestHandler
	def do_GET(self):
		request = urlparse.urlparse(self.path)
		query = urlparse.parse_qs(request.query)
		if request.path == '/status.json':
			returndata = dict()
			if 'start' in query and 'end' in query:
				start = query['start'][0]
				end = query['end'][0]
				if start.isdigit() and end.isdigit() and int(end) >= int(start):
					returndata['history'] = list()
					for day in range(int(start), int(end)+1):
						daydata = db.get(str(day))
						if daydata == None:
							daydata = [0] * int(24*60/SAMPLE_PERIOD)
						returndata['history'].append(daydata)
			if 'mode' in query:
				mode = query['mode'][0]
				db.set('mode', mode)
				set_heater()
			if 'target' in query:
				target = float(query['target'][0])
				db.set('target', target)
				if not 'mode' in query:
					set_heater()
			if 'minutes_remaining' in query:
				minutes_remaining = int(query['minutes_remaining'][0])
				db.set('minutes_remaining', minutes_remaining)
			returndata['current_day'] = get_day()
			returndata['current_time'] = get_time()
			returndata['last_reading'] = db.get('last_reading')
			returndata['mode'] = db.get('mode')
			returndata['heater_on'] = db.get('heater_on')
			returndata['target'] = db.get('target')
			returndata['minutes_remaining'] = db.get('minutes_remaining')
			self.send_response(200)
			self.send_header("Content-type", "text/html")
			self.end_headers()
			self.wfile.write(json.dumps(returndata))
		else:
			self.path = '/server/' + request.path
			self.super.do_GET(self)
	
	def do_POST(self):
		self.send_response(200)
		self.send_header("Content-type", "text/html")
		self.end_headers()
		self.wfile.write("<html><head><title>Huh?</title></head>")
		self.wfile.write("<body><p>What do you want?</p>" % a)
		self.wfile.write("</body></html>")

server_class = BaseHTTPServer.HTTPServer
httpd = server_class((HOST_NAME, PORT_NUMBER), MyHandler)
print time.asctime(), "Server Starts - %s:%s" % (HOST_NAME, PORT_NUMBER)
try:
	httpd.serve_forever()
except KeyboardInterrupt:
	pass
httpd.server_close()
wrt_ser.close()
sched.shutdown(wait=False)
db.dump()
print time.asctime(), "Server Stops - %s:%s" % (HOST_NAME, PORT_NUMBER)
#!/usr/bin/python3
import psycopg2 # Respects https://www.python.org/dev/peps/pep-0249/ and enables communication with Postgres
import sys, os
dbconnstr = "dbname=secondVerification" # follows specification at https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING

def application(environ):
	global dbconnstr
	conn = psycopg2.connect(dbconnstr) # See https://www.psycopg.org/docs/module.html#psycopg2.connect
	cur = conn.cursor() # See https://www.psycopg.org/docs/connection.html#connection.cursor , https://www.psycopg.org/docs/cursor.html#cursor and https://www.python.org/dev/peps/pep-0249/#cursor-objects
	cur.execute("SELECT domain FROM whitelist WHERE domain=%s", (str(sys.stdin.read()),))
	result = cur.fetchone() # See https://www.psycopg.org/docs/cursor.html#cursor.fetchone and https://www.python.org/dev/peps/pep-0249/#fetchone
	if result == None: # If postgres does not have any record of `domain` then it returns 'None' (general speaking)
		print("false", end="") # Echoes that the domain that requested verification is **not** a trusted domain
	else:
		print("true", end="") # Echoes that the domain that requested verification is actually a trusted domain

print("Content-Type:", "text/plain;charset=utf-8", end="\r\n\r\n") # Content-Type: text/plain;charset=utf-8\r\n\r\n
application(os.environ)

# secondVerification - Backend

The backend ( `verifier.cgi` ) (the verification service) for the client (browser extension) of secondVerification.

It uses the database application PostgresSQL for storing a list of domains which can be trusted. An authority must set up the database infrastructure and then can add or remove trusted domains as needed and it is in charge of taking care of its power. The authority must secure its systems and therefore also this backend against criminals.

## Specification

The service does not run in background as a service, rather it gets called by a server application like `apache2` and takes the domain name as POST argument (it does not work with GET). Onces it gets called and receives a domain name from the client (the browser extension), it looks up in the database if it exists. If the domain exists in the database, then this backend returns `true` to the client which means that the domain for which the client has requested verification can be trusted. If the backend returns `false` then it means that the backend hasn't found the said domain in the database.

The backend reads the POST argument through stdin and prints out the result (`true` or `false`) to stdout. As header the backend returns a `Content-Type: text/plain;charset=utf-8` . Refer also to CGI specification [Response Header](https://tools.ietf.org/html/rfc3875#section-6.3) and [Response Body](https://tools.ietf.org/html/rfc3875#section-6.2.1) .

## Setting up

1. Install the required library by issueing `pip3 install psycopg2` (the library needed to communicate with the PostgresSQL database).

2. Create a database giving it any name you want.

3. Open the code of `verifier.cgi` and alter the variable `dbconnstr` which is a string to match your database and optionally its credentials following the specification at https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING and save your changes.

4. Create a table in the public schema and call it `whitelist`.
   
   - It has only one column called `domain` . This is from type `text` and cannot contain `null`.

5. Say your server application (e.g. apache2) to execute the CGI script (if it is being called) and give it the necessary permission to do so.

6. Give your server application read-access to the database.

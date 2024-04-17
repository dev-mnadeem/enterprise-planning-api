# backend-admin

## Set up local env

Copy `.env.example` to a `.env` file

## Set up local database

### Install Postgres version 14

```bash
brew install postgresql@14
```

### Start Postgres server

```bash
brew services start postgresql@14
```

### Create default Postgres user

For Macs with M1 chip:

```bash
/opt/homebrew/bin/createuser -s postgres
```

For Macs with Intel chip:

```bash
/usr/local/opt/postgresql@11/bin/createuser -s postgres
```

### Run DB Migrations

```bash
pnpm migration:run
```

### Documentation

Documentation for all services is defined using OpenAPI 3.0 in `./reference/backend-admin.openapi.yml`. This file should be kept up-to-date when changes to APIs occur. This spec can be imported into Postman for use in development. The conversion from OpenAPI 3.0 to Postman Collection is handled via Portman by running `lerna run --scope=backend-admin portman`. Before you do this, please make sure you have a `.env` file with the following information in the root of your repo:

```
# Get this from your Postman account
POSTMAN_API_KEY=YOUR_POSTMAN_API_KEY
# The name of the Workspace you want to import the collection to
POSTMAN_WORKSPACE_NAME=YOUR_POSTMAN_WORKSPACE_NAME
# The collection you want to import to. This can be obtained by copying the link to the collection and opening it in your browser. The last url segment (after /collection/) is the UID.
POSTMAN_COLLECTION_UID=YOUR_POSTMAN_COLLECTION_UID
```

### Dev User Setup

In local development, we have an option to generate a fake token so you don't have to go through a SAML flow (which is challenging with local, non-public applications). The only requirement to use this is that you have a user in the database. Currently the best way to do this is as follows:

First, go to https://ulidgenerator.com/ and copy a new ULID to your clipboard.

```sh
# Note: Do all this AFTER you have run the migrations referenced above.
# Log into your PG database
psql --username postgres --dbname aha-rewards

# Now you're logged into the PG console...

# Insert your user into the user table:
#   (For logging into the shop app locally, use the email address specified in `frontend-shop/.env.development` NEXT_PUBLIC_USER_EMAIL variable)
INSERT INTO public."user" ("id", "firstName", "lastName", email, "dateOfBirth", "emailVerified", "signUpDate") VALUES ('YOUR_ULID_FROM_ABOVE', 'YOUR_FIRST_NAME', 'YOUR_LAST_NAME', 'YOUR_EMAIL_ADDRESS', 'YOUR_DATE_OF_BIRTH_IN_YYYY-MM-DD_FORMAT', TRUE, 'TODAY_IN_YYYY-MM-DD_FORMAT');

# Insert program, store, and storeUser records:
#  (Optional but required for running shop app locally)
INSERT INTO public."program" ("id", "name", "apiKey") VALUES ('PROGRAM_ID_1', 'Test Program', 'apikey');
INSERT INTO public."store" ("id", "programId", "name", status, "eventDate") VALUES ('01HKB2TXQWSVWMS1XHWHZ4GQ1J', 'PROGRAM_ID_1', 'Test Store', 'published', '2024-11-01');
INSERT INTO public."store_user" ("id", "storeId", "userId", "consId", "pointsEarned", "pointsRedeemed", "pointsBalance", "amountRaised", "coach") VALUES ('storeUserId', '01HKB2TXQWSVWMS1XHWHZ4GQ1J', 'YOUR_ULID_FROM_ABOVE', 'consId', 0, 0, 0, 0, false);

# Exit PG console
quit;
```

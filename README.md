# ADINKRA-BE

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

### Install npm packages

```bash
npm i
```

### Seed DATA

```bash
npm run seed:countries

npm run seed:states

npm run seed:cities

npm run seed:location-types

npm run seed:vehicle-types

npm run seed:permissions

npm run seed:user-roles

npm run seed:admin

```

### Run Server
```bash
npm run dev
```

# Adinkra API

Backend for a cargo and logistics platform. It handles orders, parcels, packages, containers, vehicles, locations and pricing, with JWT login and role-based permissions on top.

Built with Express, TypeORM and PostgreSQL, written in TypeScript. Input is validated with Zod.

## Features

- Signup, login and refresh tokens (access tokens expire after 15 minutes, refresh tokens after a day)
- Roles and permissions, enforced per route with `authenticateRole`
- CRUD for orders, parcels, packages, containers, vehicles, vehicle types and locations
- Reference data for countries, states, cities and areas
- Seed scripts for roles, permissions, location types, vehicle types and an admin user

## Running locally

The easiest way is Docker Compose, which starts Postgres and the API:

```bash
docker compose up -d --build
docker compose --profile tools run --rm seed
```

The API listens on `http://localhost:3006/api`. The seed creates an admin account: `admin@example.com` / `Helloworld`. Change it if you deploy this anywhere.

Without Docker, copy `.env.example` to `.env`, point it at your own Postgres database, then:

```bash
npm install
npm run seed:permissions
npm run seed:user-roles
npm run seed:admin
npm run dev
```

Other seeders are available too (`seed:location-types`, `seed:vehicle-types`, `seed:countries`, `seed:states`, `seed:cities`).

For a production build: `npm run build` then `npm start`.

## Tests

The tests in `tests/authorization.test.ts` are API contract tests. They call a running instance, so start the stack and seed it first:

```bash
npm run test:api
```

They check that tokens expire, that requests without a valid token get 401/403, that a self-registered customer can't reach the admin routes (users, roles, permissions), and that password hashes are never returned. Set `API_BASE` if the API isn't on `http://localhost:3006/api`.

## Project layout

```
src/
  routes/        one router per resource
  controllers/   request handling
  dal/           data access
  entities/      TypeORM models
  schemas/       Zod schemas
  middlewares/   authenticateJWT, authenticateRole, validate
  seeding/       seed scripts
tests/
```

## Notes

- CORS origins come from `FRONT_END_DOMAIN` (comma separated in `docker-compose.yml`).
- The server won't start listening if it can't connect to the database.

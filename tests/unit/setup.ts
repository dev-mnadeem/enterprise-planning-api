import 'reflect-metadata';

process.env.JWT_SECRET_KEY ??= 'unit-test-access-secret';
process.env.REFRESH_TOKEN_SECRET_KEY ??= 'unit-test-refresh-secret';

import { TEST_DATABASE } from './utils/test-database';

// AppModule valida estas variables al importarse, antes de que corra initTestApp.
// La conexión real de los tests la define initTestApp con TEST_DATABASE, no estas variables.
process.env.NODE_ENV ??= 'development';
process.env.DB_HOST = TEST_DATABASE.host;
process.env.DB_PORT = String(TEST_DATABASE.port);
process.env.DB_USERNAME = TEST_DATABASE.username;
process.env.DB_PASSWORD = TEST_DATABASE.password;
process.env.DB_NAME = TEST_DATABASE.database;
// Dominio inexistente: si algún pedido escapara del mock, falla en vez de salir a internet
process.env.SWAPI_BASE_URL = 'https://swapi.test/api';

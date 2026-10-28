// Parámetros de la base de prueba (servicio postgres-test de docker-compose).
// Son independientes de los de la app: se pueden cambiar con las variables TEST_DB_*.
export const TEST_DATABASE = {
  host: process.env.TEST_DB_HOST ?? 'localhost',
  port: Number(process.env.TEST_DB_PORT ?? 5433),
  username: process.env.TEST_DB_USERNAME ?? 'seed_test',
  password: process.env.TEST_DB_PASSWORD ?? 'seed_test',
  database: process.env.TEST_DB_NAME ?? 'seed_test',
};

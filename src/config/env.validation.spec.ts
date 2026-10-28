import { Environment, validate } from './env.validation';

const validEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USERNAME: 'seed',
  DB_PASSWORD: 'secret',
  DB_NAME: 'seed',
  SWAPI_BASE_URL: 'https://swapi.dev/api',
};

describe('validate (env)', () => {
  it('applies defaults and converts types', () => {
    const config = validate(validEnv);

    expect(config.NODE_ENV).toBe(Environment.Development);
    expect(config.PORT).toBe(3000);
    expect(config.DB_PORT).toBe(5432);
    expect(config.DB_SYNCHRONIZE).toBe(false);
  });

  it.each([
    ['true', true],
    ['false', false],
  ])('parses DB_SYNCHRONIZE=%s as %s', (value, expected) => {
    expect(
      validate({ ...validEnv, DB_SYNCHRONIZE: value }).DB_SYNCHRONIZE,
    ).toBe(expected);
  });

  it('fails when a required variable is missing', () => {
    const withoutPassword: Record<string, unknown> = { ...validEnv };
    delete withoutPassword.DB_PASSWORD;

    expect(() => validate(withoutPassword)).toThrow(
      'Invalid environment variables',
    );
  });

  it('fails when NODE_ENV is not a known environment', () => {
    expect(() => validate({ ...validEnv, NODE_ENV: 'staging' })).toThrow(
      'Invalid environment variables',
    );
  });
});

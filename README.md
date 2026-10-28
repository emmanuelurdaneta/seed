# NestJS Basic Application

Aplicación básica de NestJS con estructura estándar.

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run start:dev
```

La aplicación estará disponible en `http://localhost:3000`

## Endpoints

- `GET /` - Retorna un saludo desde el servicio
- `GET /health` - Verifica el estado de la aplicación

## Build

```bash
npm run build
```

## Producción

```bash
npm run start:prod
```

## Testing

```bash
npm test
```

## Estructura

```
src/
  ├── main.ts              # Entry point
  ├── app.module.ts        # Módulo raíz
  ├── app.controller.ts    # Rutas HTTP
  └── app.service.ts       # Lógica de negocio
```

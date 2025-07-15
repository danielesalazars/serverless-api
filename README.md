# Microservice

```text
├── .gitignore             # Ignora archivos que no deben subirse
├── .env.local             # Variables de entorno locales
├── .prettierignore        # Rutas ignoradas por Prettier
├── .prettierrc            # Configuración de Prettier
├── applicationDB.sql      # Script SQL para inicialización de la base de datos
├── docker-compose.yml     # Orquestación de contenedores para desarrollo
├── Dockerfile             # Imagen del servicio
├── eslint.config.mjs      # Configuración de ESLint
├── nest-cli.json          # Configuración CLI de NestJS
├── package.json           # Dependencias y scripts del proyecto
├── pnpm-lock.yaml         # Lockfile de PNPM
├── README.md              # Documentación principal del proyecto
├── tsconfig.build.json    # Configuración de TypeScript para build
├── tsconfig.json          # Configuración base de TypeScript
├── test/                  # Pruebas unitarias y de integración
├── scripts/               # Scripts SQL, migraciones, seeds, etc.
└── src/
    ├── main.ts            # Punto de entrada de la aplicación (bootstrap)
    ├── app.module.ts      # Módulo raíz de la aplicación
    ├── lib/
    │   ├── config/                       # Configuración global
    │   ├── constants/                    # Constantes generales
    │   ├── exceptions/                   # Filtros y excepciones globales
    │   ├── external/
    │   │   └── azure/
    │   │       └── sql-database/         # Cliente para Azure SQL Server
    │   │           ├── sql-database.config.ts          # Configuración del cliente SQL
    │   │           ├── sql-database.module.ts          # Módulo NestJS para SQL Database
    │   │           └── sql-database.service.ts         # Servicio que abstrae la conexión SQL
    │   ├── utils/                        # Funciones utilitarias
    │   └── validations/                  # Validadores globales
    ├── modules/
    │   └── users/
    │       ├── user.module.ts            # Módulo del dominio Users
    │       ├── application/              # Casos de uso, DTOs, mappers, etc.
    │       │   ├── constants/                  # Constantes específicas del módulo Users
    │       │   ├── dtos/                       # DTOs de entrada/salida
    │       │   ├── mappers/                    # Mappers entre entidades y DTOs
    │       │   ├── services/                   # Servicios de aplicación
    │       │   ├── use-cases/                  # Casos de uso del módulo Users
    │       │   └── validations/                # Validadores específicos (class-validator, etc.)
    │       ├── domain/                   # Entidades, repositorios, value-objects
    │       │   ├── entities/                   # Entidades de dominio (UserEntity, etc.)
    │       │   ├── repositories/               # Interfaces de repositorios (puertos)
    │       │   ├── services/                   # Servicios de dominio (reglas de negocio puras)
    │       │   └── value-objects/              # Value Objects (Email, UserId, etc.)
    │       └── infrastructure/           # Implementaciones técnicas
    │           ├── controllers/                # Controladores HTTP del módulo
    │           ├── factories/                  # Fábricas para instanciar repositorios dinámicamente
    │           ├── guards/                     # Guards de auth/roles
    │           └── repositories/
    │               └── data-access/
    │                   ├── sql/                # Implementación basada en queries SQL
    │                   │   ├── user.queries.ts                   # Consultas SQL raw
    │                   │   └── user.repository.impl.ts           # Implementación del repositorio SQL
    │                   ├── typeorm/            # Implementación basada en TypeORM
    │                   │   ├── user.entity.ts                    # Entidad TypeORM
    │                   │   └── user.repository.impl.ts           # Implementación del repositorio TypeORM
    │                   └── mongoose/           # Implementación basada en Mongoose
    │                       ├── user.schema.ts                    # Esquema Mongoose
    │                       └── user.repository.impl.ts           # Implementación del repositorio Mongoose
```

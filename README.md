# POSTS MICROSERVICE

## Instalaciones necesarias

Asegurarse de tener instalado en su sistema:

- pnpm -> `pnpm i -g pnpm`
- serverless -> `pnpm i -g serverless`
- docker -> https://docs.docker.com/engine/install/

## Levantar entorno local

#### Variables de entorno

Renombrar archivo ".env.example" a ".env" y configurar las variables de entorno _en caso de ser necesario_

#### Levantar base de datos local

    pnpm db:up

#### Levantar servidor http en desarrollo

    pnpm start:dev

#### Levantar serverless en desarrollo

    pnpm sls:dev

## Eliminar base de datos local

    pnpm db:down

## Despliegue a produccion (AWS)

> Asegurarse de tener instalado el cli de AWS, si no lo tiene instalado descarguelo y configure un usuario para usar el CLI local

#### API Gateway

Antes de hacer el despliegue del servicio tiene que haber creada una Api Gateway simple, sin ninguna ruta ni conexiones a ninguna lambda y con el stage "$default".

Tengo que copiarme el id de la api gateway para agregarlo a las variables de entorno.

#### Variables de entorno

> Debe tener creada una base de datos de mongo, en mi caso la cree en [Mongo Atlas](https://account.mongodb.com/) y crear un usuario para poder usar esta base de datos ("Security" -> "Database Access" -> "Add new database user" -> _Crea nombre de usuario con contraseña_ -> "Role"="Atlas admin" -> "Restrict Access to Specific Clusters/Federated Database Instances/Stream Processing Instances"=_selecciona db creada_).

Crear archivo `.env.prod` y configurar las variables de entorno necesarias para produccion

- MONGO_URI=... (string de conexion a base de datos de MongoDB con su nombre de usuario y contraseña)
- API_GATEWAY_ID= (id de api gateway creado)
- AUTHORS_FUNCTION_NAME= (Si ya se sabe el nombre de la lambda de authors agregarlo en este archivo, sino configurarlo despues en consola de aws)

> Una vez desplegado este servicio configurar los permisos de la lambda de "authors" para que esta lambda pueda ejecutarla.

#### Deploy

    pnpm sls:prod

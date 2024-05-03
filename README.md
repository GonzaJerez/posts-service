# POSTS MICROSERVICE

## Instalaciones necesarias

Asegurarse de tener instalado en su sistema:

- pnpm -> `pnpm i -g pnpm`
- serverless -> `pnpm i -g serverless`
- docker -> https://docs.docker.com/engine/install/

## Prerequisitos

### AWS CLI (prod)

> [!INFO]
> Asegurarse de tener instalado el cli de AWS, si no lo tiene instalado descarguelo y configure un usuario para usar el CLI local
> Para utilizar los distintos servicios de aws como la invocación de lambdas o subida de imagenes a S3 pero corriendo el proyecto de forma local, este usuario de AWS CLI debe tener por lo menos esos permisos

### S3 (prod)

Un bucket S3 de destino. Este bucket debe tener acceso publico (Habilitar acceso publico y ademas establecer politicas para este acceso publico)

## SQS

Una cola donde se reciban todos los eventos que le interesan a este servicio. Para el ejemplo se configuro un SQS de tipo "fifo".

### API Gateway (prod)

Antes de hacer el despliegue del servicio hay que crear una Api Gateway simple, al crearla hacerlo sin ninguna ruta ni conexiones a ninguna lambda y con el stage "$default". Las rutas se crearán automáticamente al desplegar esta la lambda.

Tengo que copiarme el id de la api gateway para agregarlo a las variables de entorno.

### MongoDB (prod)

> Debe tener creada una base de datos de mongo, en mi caso la cree en [Mongo Atlas](https://account.mongodb.com/) y crear un usuario para poder usar esta base de datos ("Security" -> "Database Access" -> "Add new database user" -> _Crea nombre de usuario con contraseña_ -> "Role"="Atlas admin" -> "Restrict Access to Specific Clusters/Federated Database Instances/Stream Processing Instances"=_selecciona db creada_).

## Levantar entorno local

#### Variables de entorno

Renombrar archivo ".env.example" a ".env" y configurar las variables de entorno _en caso de ser necesario_

#### Levantar base de datos local

    pnpm db:up

#### Levantar servidor http en desarrollo

    pnpm start:dev

#### Levantar serverless en desarrollo

    pnpm sls:dev

> [!WARNING]
> En modo serverless en local no funciona la subida de archivos a S3

## Eliminar base de datos local

    pnpm db:down

## Despliegue a produccion (AWS)

#### Variables de entorno

Crear archivo `.env.prod` y configurar las variables de entorno necesarias para produccion

- MONGO_URI=... (string de conexion a base de datos de MongoDB con su nombre de usuario y contraseña)
- API_GATEWAY_ID= (id de api gateway creado)
- SQS_QUEUE_ARN= (arn de la cola de sqs que le emite eventos a esta lambda)
- AUTHORS_QUEUE_URL= (URL de la queue del servicio de authors para poder enviarle mensajes)
- AWS_BUCKET_NAME= (nombre del bucket de s3 al que se van a subir los archivos)
- AWS_BUCKET_REGION= (region de aws donde se encuentra el bucket s3. Ej sa-east-1)

#### Deploy

    pnpm sls:prod

#### Permisos

**Permitir invocaciones de lambdas**

Una vez desplegado este servicio configurar los permisos de la lambda para que otras lambdas puedan invocarla. Esto puede hacerse de 2 maneras, dandole permisos a las lambdas para que puedan invocar a otras o diciendole a las lambdas que otras funciones pueden invocarla.

Para la primera opción ir a "Configuration" -> "Permissions" -> "Execution role" -> "Role name" -> Selecciono el rol para ir a la configuración del mismo -> agrego la politica lambda:invokeFunction al rol y especifico las funciones lambda que puede invocar.

De esta forma esta lambda ya puede invocar otras lambdas.

Para la segunda opción ir a "Configuration" -> "Permissions" -> "Resource-based policy statements" -> "Add permission" -> Se le asigna nombre al permiso, se agrega la arn del rol de la lambda que haria la invocacion a esta (en este caso la arn del permiso de la lambda de authors), y selecciono el permiso al que se le da acceso: lambda:invokeFunction.

De esta forma esta lambda puede ser invokada por cualquier lambda que tenga el rol seleccionado (en este caso la lambda de authors)

**Subir archivos a bucket S3**

Crearle un permiso para que esta lambda pueda subir archivos a S3.

Para esto tengo que entrar al rol de la lambda ("Configuration" -> "Execution role") y agregarle una politica.

Esta politica tiene que tener el permiso _putObject_ y apuntar al bucket correspondiente.

**Enviar eventos a SQS**

Crearle un permiso para que esta lambda pueda emitir eventos a ciertas colas de SQS.

Para esto tengo que entrar al rol de la lambda ("Configuration" -> "Execution role") y agregarle una politica.

Esta politica tiene que tener el permiso _sqs:SendMessage_ y apuntar a la cola correspondiente (en este caso al SQS de authors)

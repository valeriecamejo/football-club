<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Football Club

1. Clonar proyecto

2. Instalar dependencias
```
npm install
```

3. Clonar el archivo ```.env.template```, renombrarlo a ```.env``` y cambiar las variables de entorno

4. Levantar base de datos
```
docker-compose up -d
```

5. Levantar en local:
Si es la primera vez que ejecutas el proyecto, deberás correr los seeds y levantar el proyecto con el siguiente comando:
```
RUN_SEEDS=true npm run start:dev
```

Si ya tienes la base de datos poblada, deberás ejecutar lo siguiente:
```
npm run start:dev
```
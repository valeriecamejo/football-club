# Usa la imagen oficial de Node.js
FROM node:16

# Instalar dockerize (utilizado para esperar a que la base de datos esté lista)
RUN apt-get update && apt-get install -y wget \
  && wget https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-linux-amd64-v0.6.1.tar.gz \
  && tar -xzvf dockerize-linux-amd64-v0.6.1.tar.gz \
  && mv dockerize /usr/local/bin/

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto donde la app correrá
EXPOSE 3000

# Usar dockerize para esperar a que la base de datos esté disponible
CMD ["dockerize", "-wait", "tcp://db:5432", "-timeout", "30s", "npm", "run", "start:dev"]
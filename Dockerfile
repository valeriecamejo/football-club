# Usa la imagen oficial de Node.js
FROM node:16

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

# Comando para ejecutar los seeds si la variable RUN_SEEDS está configurada
CMD ["sh", "-c", "if [ \"$RUN_SEEDS\" = \"true\" ]; then npm run run-seeds; fi && npm run start:dev"]
# Imagem base oficial do Node.js para rodar o microsservico.
FROM node:20-alpine

# Diretorio interno da aplicacao dentro do container.
WORKDIR /app

# Copia os arquivos de dependencias primeiro para aproveitar cache de build.
COPY package*.json ./
COPY tsconfig.json ./

# Instala as dependencias do microsservico.
RUN npm install

# Copia o restante do codigo da aplicacao.
COPY src ./src

# Compila os arquivos TypeScript para JavaScript.
RUN npm run build

# Expõe a porta HTTP do microsservico.
EXPOSE 3002

# Comando de inicializacao do servico.
CMD ["node", "dist/server.js"]

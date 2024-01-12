# Utiliser l'image officielle de Node.js
FROM node:16.20

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances du projet
RUN npm install

# Copier les fichiers et dossiers du projet dans l'image Docker
COPY . .

# Exposer le port sur lequel l'application s'exécute
EXPOSE 8080

# Commande pour démarrer l'application
CMD ["npm", "start"]

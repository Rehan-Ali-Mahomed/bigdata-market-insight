## Contexte

Ce document fournit les instructions nécessaires pour utiliser l'application de consulting pour une Entreprise de Services du Numérique (ESN).
L'application offre des visualisations de données pour aider à la prise de décision et à l'analyse des tendances du marché.

### Note - Schéma d'architecture

Afin de terminer le projet à temps, le schéma d'architecture de l'application a été modifié afin d'utiliser des technologies mieux maîtrisées.

## 🚀 Usage

N.B: Lors de la génération de nouvelle données :
- Le site nécessite de patienter quelques secondes
- Afin de voir la différence et des temps de traitement court, il est préférable de ne pas dépasser un total de 1500 (consultants + marchés)

Vous pouvez appuyer sur une légende dans un graphique pour afficher / masquer ses données dans le graphique.

### En ligne

Les liens ci-dessous permettent d'accéder au site internet sans avoir d'installation à effectuer.
La disponibilité du site n'est **pas garantie** ! Il peut être en **panne** ou être en **maintenance**.

```bash
# API - Données Marchés
curl https://market-insight.amadiy.com/api/getMarketStat

# API - Données des consultants
curl https://market-insight.amadiy.com/api/getStat

# Dashboard
https://market-insight.amadiy.com/
```

### Local

```bash
# API - Données Marchés
curl http://localhost:8080/api/getMarketStat

# API - Données des consultants
curl http://localhost:8080/api/getStat

# Dashboard
http://localhost:8080/dashboard.html
```

### 🛠️ Installation Manuelle

#### Prérequis
- npm >= 9.2.0
- Node.js >= 16.15.0

#### Cloner le répertoire
```bash
git clone
```

#### Installation des dependances
```bash
npm install
```

#### Variables d'environnement

Vous pouvez modifier les variables d'environnements si besoin :

```bash
DB_HOST=AdresseIP_BDD
DB_NAME=Nom_BDD
DB_USERNAME=Identifiant_BDD
DB_PASSWORD=Motdepasse_BDD

HTTP_PORT=8080
```

#### Démarrage de l'application
```bash
npm start
```

Accédez à l'application via un navigateur web à l'adresse : http://localhost:8080/.

---

### ✨ Utilisation de Docker

#### Démarrage du container MongoDB

```bash
docker run -d --name bigdata-mongodb -p 27017:27017 -e MONGO_INITDB_DATABASE=BigData
```

#### Démarrage du container de l'application

```bash
docker run -d --name bigdata-app -p 8080:8080 --link mongodb:mongodb -e DB_HOST=mongodb -e DB_NAME=BigData rehanalimahomed/bigdata-market-insight:latest
```

---
### 🤖 Installation with docker-compose
```bash
docker-compose up

# Run as deamon (in backgroud)
docker-compose up -d
```

## 👤 Rehan Ali-Mahomed

- Github: [@Rehan-Ali-Mahomed](https://github.com/Rehan-Ali-Mahomed)

- DockerHub: [@rehanalimahomed](https://hub.docker.com/repository/docker/rehanalimahomed/bigdata-market-insight/general)

- Date : 12/01/2024
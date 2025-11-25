# Hackathon Prefecture — Client

A minimal client application for the Hackathon Prefecture project.

## Requirements

- Node.js 14+ or compatible
- npm or yarn

## Setup

Install dependencies:

	npm install
	# or
	yarn install

## Run

Start development server:

	npm start
	# or
	yarn start

## Notes

Add project-specific instructions here (build, test, environment variables).
## Présentation

Ce dépôt contient le client web pour le projet "Hackathon Prefecture". Il s'agit d'une application front-end minimale destinée à être déployée comme interface utilisateur pour les services du back-end (API).

Technologies principales :
- React (ou framework front-end utilisé)
- Vite / Create React App (selon le scaffold)
- CSS / Tailwind / Styled Components (selon le projet)

## Fonctionnalités

- Interface utilisateur réactive
- Authentification basique (si applicable)
- Appels API vers le back-end pour récupération et envoi de données
- Gestion d'état simple (Context / Redux / Zustand selon utilisation)
- Routes côté client

## Arborescence recommandée

Exemple minimal :
- src/
    - components/    # composants réutilisables
    - pages/         # vues/pages
    - services/      # appels API
    - hooks/         # hooks personnalisés
    - assets/        # images, polices
    - styles/        # feuilles de style globales
    - App.jsx
    - index.jsx
- public/
- .env.example
- package.json
- README.md

## Variables d'environnement

Créez un fichier `.env` ou `.env.local` à la racine avec les variables nécessaires. Exemple :

NODE_ENV=development
VITE_API_BASE_URL=https://api.example.com
REACT_APP_API_BASE_URL=https://api.example.com
# Ajoutez ici d'autres variables (clé, feature flags...)

Ne commitez jamais de secrets dans le dépôt.

## Scripts utiles

- npm start / yarn start — démarrer le serveur de développement
- npm run build / yarn build — générer les fichiers de production
- npm test / yarn test — exécuter les tests
- npm run lint / yarn lint — vérifier le lint
- npm run format / yarn format — formater le code

Exemple package.json scripts :
```json
{
    "scripts": {
        "start": "vite",
        "build": "vite build",
        "preview": "vite preview",
        "test": "vitest",
        "lint": "eslint . --ext .js,.jsx,.ts,.tsx"
    }
}
```

(adaptez selon votre stack)

## Développement local

1. Installer les dépendances :
     npm install
     # ou
     yarn install

2. Copier .env.example vers .env et ajuster les valeurs.

3. Lancer l'application :
     npm start

4. Ouvrir http://localhost:3000 (ou le port indiqué) dans le navigateur.

## Build et déploiement

Générer la version de production :
npm run build

Options de déploiement courantes :
- Vercel / Netlify : pousser le repo et connecter le dépôt ; configurer la commande de build (`npm run build`) et le dossier de sortie (`dist` ou `build`).
- Docker : créer une image multi-stage pour servir les fichiers statiques via nginx.
- Hébergement statique (S3 + CloudFront, GitHub Pages) : uploader le dossier de build.

Exemple Dockerfile simple :
```dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Tests

- Ecrire des tests unitaires pour composants critiques.
- Utiliser Vitest / Jest + Testing Library pour les tests UI.
- Exécuter `npm test` en local et intégrer dans CI.

## Accessibilité et performances

- Vérifier l'accessibilité (axe, Lighthouse).
- Optimiser les images (Lazy loading, formats modernes).
- Activer le Tree Shaking et la minification pour la production.
- Mettre en place un caching long terme pour les assets.

## CI / CD

- Intégrer un pipeline CI pour lint, tests et build (GitHub Actions, GitLab CI, etc.).
- Déployer automatiquement sur push vers la branche main/master ou via tag.

Exemple minimal GitHub Actions (build + deploy) :
- name: CI
    on: [push]
    jobs:
        build:
            runs-on: ubuntu-latest
            steps:
                - uses: actions/checkout@v3
                - uses: actions/setup-node@v3
                    with:
                        node-version: '18'
                - run: npm ci
                - run: npm run build

(adaptez la suite pour déploiement)

## Débogage & dépannage

- Erreurs d'API : vérifier la variable d'environnement de base URL et les CORS côté back-end.
- Erreurs de compilation : supprimer node_modules et le cache, puis réinstaller.
- Problèmes de dépendances : utiliser `npm ci` pour installations reproductibles.

## Contribution

- Forkez le dépôt, créez une branche feature/bugfix, committez et ouvrez une Pull Request.
- Respectez les conventions de code, lancez les tests et le lint avant PR.
- Documentez toute nouvelle variable d'environnement ou script.

## Licence

Indiquer la licence du projet (ex: MIT). Exemple :
MIT © Votre Organisation

## Contacts

Pour toute question : ouvrir une issue sur le dépôt ou contacter l'équipe du projet.

## Historique des changements

Tenez un changelog simplifié (ex: KEEP A CHANGELOG ou utiliser les releases GitHub) pour tracer les évolutions majeures.
# TrackNutri

Une application simple pour suivre les nutriments de vos repas. Elle fournit une interface web responsive pour ajouter des aliments, fixer des objectifs quotidiens et analyser des recettes.

## Lancer l'application en local

```bash
node server.js
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

## Déploiement sur Render

1. Créez un nouveau service Web sur Render et connectez ce dépôt.
2. Utilisez la commande de démarrage suivante :
   ```bash
   node server.js
   ```
3. Le port est défini via la variable d'environnement `PORT` automatiquement par Render.

Les données sont enregistrées dans `data.json`. Pour une utilisation en production, envisagez d'utiliser une base de données persistante.

## Tests

```bash
npm test
```

Des tests Jest vérifient la présence des fichiers principaux. Un workflow GitHub Actions exécute automatiquement ces tests à chaque pull request.

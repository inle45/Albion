# Albion Dashboard

Tableau de bord SPA pour Albion Online — suivi économique, gestion d'arsenal, journal PvP et tâches journalières.
Toutes les données sont stockées dans le **LocalStorage** du navigateur (aucun serveur).

## Stack

- React 18 + Vite
- Tailwind CSS (thème dark sombre, accents or / argent / sang)
- `lucide-react` pour les icônes
- LocalStorage via un hook `useLocalStorage`

## Démarrage

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de prod dans /dist
npm run preview  # preview du build
```

## Modules

### 1. Économie — Affinage & Marché Noir
- **Calculateur d'affinage** : prix brut, ratio brut/raffiné, RRA (%), prix de revente, taxes — calcule le coût ressource (RRA appliqué), revenu net, profit net et marge.
- **Tracker de Flip** : tableau d'objets (achat ville / vente Marché Noir / quantité). Calcule le spread net (taxe BM 4 %), la marge en %, met en évidence l'objet le plus rentable et le profit total potentiel.

### 2. Arsenal — Gear Fear & Loadouts
- **Budget** : fortune totale → budget « perdable » à 20 %.
- **Loadouts** : nom, coût, rôle, notes. Pour chaque set :
  - **% de la fortune** (barre de progression : or → sang).
  - **Risk Ratio** : `(20 % de la fortune) / coût du set` = nombre de morts avant d'atteindre le seuil de gear fear.
  - Alerte rouge si un set dépasse 20 % de la fortune.
  - **Checklist avant départ** (monture, bouffe, potions, capes — extensible) cochable au clic, avec compteur `n/total` et badge "Prêt à sortir" quand tout est coché.

### 3. Progression — Fame Tracker
- **Chronomètre** Start / Stop / Reset persistant (timestamp-based, survit aux refresh).
- Saisie de la **fame** gagnée + étiquette de session (zone farmée).
- Calcul automatique de la **Fame / heure** en temps réel.
- Bouton "Sauver session" → historique avec stats cumulées (temps total, fame totale, fame/h moyenne, meilleure session).

### 4. Gestion d'Île — Minuteurs
- **Presets rapides** (Carottes 22h, Choux 36h, Citrouilles 96h, Vache, Mouton, Bois, Fleur…).
- Création de minuteur personnalisé (nom + heures + minutes + icône).
- Barre de progression dorée en temps réel, date/heure de fin lisible.
- Pulse doré + badge "Prêts à récolter" quand un minuteur arrive à terme.
- Redémarrer / supprimer en un clic.

## Stockage

Toutes les clés sont préfixées `albion-dashboard:` dans le LocalStorage :

| Clé                           | Contenu                              |
| ----------------------------- | ------------------------------------ |
| `app.route`                   | Module actif                         |
| `app.fortune`                 | Fortune totale (silver)              |
| `economy.refining`            | Champs du calculateur d'affinage     |
| `economy.flips`               | Liste des flips Marché Noir          |
| `arsenal.loadouts`            | Loadouts + checklist par loadout     |
| `progression.chrono`          | Chrono de session courante           |
| `progression.sessions`        | Historique des sessions sauvegardées |
| `island.timers`               | Minuteurs d'île (timestamp-based)    |

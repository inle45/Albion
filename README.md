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

### 3. PvP — Journal de Combat
- Stats agrégées : Kills / Deaths / Assists / K/D / Fame totale / Loot net.
- Journal d'engagements (kill, mort, assist) avec cible, fame, loot, zone, date.

### 4. Tâches Journalières
- Checklist groupée par catégorie (PvE, PvP, Récolte, etc.).
- Reset automatique chaque jour (heure locale) ou manuel.
- Ajout / suppression de tâches personnalisées.

## Stockage

Toutes les clés sont préfixées `albion-dashboard:` dans le LocalStorage :

| Clé                           | Contenu                              |
| ----------------------------- | ------------------------------------ |
| `app.route`                   | Module actif                         |
| `app.fortune`                 | Fortune totale (silver)              |
| `economy.refining`            | Champs du calculateur d'affinage     |
| `economy.flips`               | Liste des flips Marché Noir          |
| `arsenal.loadouts`            | Liste des loadouts                   |
| `pvp.entries`                 | Journal de combats                   |
| `quests.tasks` / `quests.done`| Tâches & complétions du jour         |

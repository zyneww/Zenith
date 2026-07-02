# Anatomie de la page Bybit Spot (`/trade/spot/BTC/USDT`)
> Hors panneau TRADE (formulaire achat/vente à droite) — exclu comme demandé.

---

## 1. Grille générale (desktop, ≥1280px)

3 colonnes flex, hauteur 100vh moins header :

```
[ Header global plateforme ]
[ Barre marché (ticker bar) — pleine largeur ]
[ Colonne Graphique (flex:1, large) | Colonne Carnet d'ordres (fixe ~280-320px) | Colonne Trade (fixe ~320px, EXCLUE) ]
[ Bandeau bas: Mes ordres / Historique / Actifs (tabs) — pleine largeur, sous Graphique+Carnet ]
```

- Pas de scroll global : chaque colonne scroll indépendamment si besoin (le carnet d'ordres surtout).
- Gouttières très fines (1px) en `border-color` discret, pas de vraies marges/ombres entre blocs — effet "dashboard dense".
- Tout est en dark mode par défaut, fond quasi noir, pas de cards avec ombre portée (flat design).

---

## 2. Barre marché (ticker bar) — juste sous le header

C'est la partie la plus différente de ta version actuelle. Sur Bybit, ce n'est PAS juste "nom + prix" alignés en deux blocs — c'est une **ligne de stats horizontale dense** :

| Bloc | Contenu |
|---|---|
| 1. Sélecteur de paire | Icône coin + `BTC/USDT` en gras + chevron ▾ (ouvre un dropdown avec recherche + liste favoris/étoile) + icône étoile (favori) à gauche du nom |
| 2. Dernier prix | Très grand, gras, **coloré** (vert si hausse depuis dernier tick, rouge si baisse) + petite flèche ↑/↓. Sous le prix : équivalent en devise fiat (ex: `≈ $XX,XXX.XX`) en gris petit |
| 3. Variation 24h | `+1.23%` coloré, label "Var. 24h" au-dessus en gris petit |
| 4. Haut 24h | valeur + label "Haut 24h" |
| 5. Bas 24h | valeur + label "Bas 24h" |
| 6. Volume 24h | en base asset (ex: BTC) + label |
| 7. Chiffre d'affaires 24h (Turnover) | en quote asset (ex: USDT) + label |

Chaque stat = empilement vertical (label petit gris au-dessus, valeur en dessous), séparées par un padding horizontal généreux, **pas de bordures verticales** entre les blocs — juste l'espacement qui sépare visuellement.

→ Sur tes captures tu n'as que prix + variation alignés à droite. Il manque Haut/Bas/Volume/Turnover et le dropdown de sélection de paire avec favoris.

---

## 3. Bloc Graphique

### Toolbar haut (au-dessus du chart)
- Bouton icône type de graphique (bougies/ligne) tout à gauche
- Groupe d'intervalles en boutons texte plats : `1m 3m 5m 15m 30m 1h 4h 1d 1w 1M` (le bouton actif a un fond légèrement plus clair / texte accentué, pas de soulignement)
- Tabs de moteur de rendu : `Standard` (chart "lite" maison) / `TradingView` (lib complète) / `Profondeur` (depth chart) — **ça tu l'as déjà correctement**
- Checkbox `Volume` et `MA` à droite des tabs — **déjà présent chez toi**
- En mode TradingView : barre d'outils additionnelle apparaît (icône réglages indicateurs, plein écran, capture d'écran, comparaison, alerte) + une colonne verticale fine d'outils de dessin tout à gauche du canvas (trait, fibo, texte, etc.) — absent chez toi sur l'image 2.

### Zone canvas
- Axe des prix à droite (pas à gauche) — **correct chez toi**
- Ligne pointillée horizontale = dernier prix, avec un label coloré (fond plein, texte blanc) collé à l'axe droit — **présent chez toi, bon point**
- MA affichées en légende flottante coin haut-gauche du canvas, format `MA(5): valeur` colorées, pas en bloc empilé à droite du prix comme sur ta capture — c'est un écart visuel notable
- Volume en bas du canvas, barres fines colorées vert/rouge selon bougie, hauteur ~15-20% du canvas total
- Grille de fond très subtile (lignes horizontales seulement, quasi invisibles, `opacity` très faible)

---

## 4. Carnet d'ordres (Order Book)

Structure complète, de haut en bas :

1. **Tabs** : `Carnet d'ordres` / `Transactions` (recent trades) côte à côte en haut — **chez toi il n'y a que "Carnet d'ordres", pas de tab Transactions**
2. **Sélecteur de précision** : petit dropdown (ex: `0.01`) en haut à droite du panneau pour regrouper les niveaux de prix
3. **Toggle vue** : 3 petites icônes (carnet complet / asks seuls / bids seuls) — souvent absent en version simplifiée
4. **Header colonnes** : `Prix (USDT)` / `Quantité (BTC)` / `Total` en gris petit, alignés à droite (chiffres toujours alignés à droite, police tabulaire)
5. **Ligne asks (ventes)** : prix en rouge, quantité/total en blanc/gris clair, **barre de profondeur en fond** (couleur rouge très transparente, largeur proportionnelle au volume cumulé, alignée à droite du panneau)
6. **Ligne spread/dernier prix** : ligne centrale plus grande, fond légèrement distinct, prix coloré + flèche, + l'équivalent fiat à côté, + souvent le `Spread` affiché en valeur ou %
7. **Lignes bids (achats)** : même logique en vert/teal, barre de profondeur verte transparente
8. **Barre ratio bas de panneau** : barre horizontale bicolore vert/rouge montrant le ratio achat/vente en %, avec les deux pourcentages affichés aux extrémités — **tu as déjà ça, bon**

Détail clé : les barres de profondeur (depth bars) sont en arrière-plan de la ligne entière, pas juste un petit fond derrière le nombre — elles partent du bord droit du panneau et s'étendent vers la gauche proportionnellement au volume cumulé.

---

## 5. Onglet Transactions (Recent Trades) — si tu veux le répliquer aussi
Liste verticale : `Prix` / `Quantité` / `Heure`, prix coloré vert (achat) ou rouge (vente) selon le côté agresseur, mise à jour temps réel avec un léger flash de fond (fade-out ~300ms) sur nouvelle ligne insérée en haut.

---

## 6. Palette de couleurs (valeurs approximatives — à vérifier via devtools, voir §8)

| Usage | Hex approx |
|---|---|
| Fond global | `#0B0E11` à `#0D0F14` (quasi noir) |
| Fond panneaux secondaires | `#14161A` à `#181A20` |
| Bordures/séparateurs | `#22252B` (très discret) |
| Texte primaire | `#EAECEF` |
| Texte secondaire/labels | `#848E9C` à `#76808F` |
| Hausse / Buy / candle up | teal-green `#0ECB81` ou `#00C076` |
| Baisse / Sell / candle down | corail `#F6465D` ou `#FF4D4F` |
| Accent marque Bybit | jaune-or `#F7A600` (logo, CTA secondaires) |

Pas de dégradés, pas d'ombres, tout en aplats. Hover sur une ligne du carnet d'ordres = fond légèrement éclairci (`#1C1F26` env.), sans transition marquée.

## 7. Typographie
- Sans-serif système : stack type `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- Chiffres en `font-variant-numeric: tabular-nums` partout (carnet, stats) pour alignement parfait colonne par colonne
- Tailles : labels ~11-12px, valeurs courantes ~13-14px, prix principal ~24-28px gras

## 8. Comportements dynamiques
- Mise à jour WebSocket : chaque changement de prix déclenche un flash de couleur bref (fond vert/rouge qui fade) sur la cellule concernée
- Le carnet d'ordres se réorganise sans scroll-jump (les nouvelles lignes s'insèrent/se suppriment en place)
- Sticky : la barre marché et la toolbar du graphique restent visibles au scroll vertical du panneau bas (ordres/historique)

---

## 9. Écarts principaux détectés sur tes 3 captures

1. Barre marché trop pauvre : juste prix+%, il manque Haut/Bas/Volume/Turnover/sélecteur de paire avec favoris
2. Pas de tab "Transactions" à côté de "Carnet d'ordres"
3. Pas de header de colonnes (Prix/Quantité/Total) visible dans le carnet
4. Pas de sélecteur de précision/décimales dans le carnet
5. MA affichées en bloc empilé à droite plutôt qu'en légende flottante haut-gauche du canvas
6. Mode "Profondeur" affiche un placeholder vide ("Profondeur indisponible") — la depth chart n'est pas implémentée
7. Toolbar TradingView incomplète : pas d'outils de dessin latéraux visibles sur l'image 2

---

## 10. Recommandation pratique pour fidélité pixel-perfect

Vu que tu as Playwright MCP configuré dans OpenCode, plus fiable que cette description :

```js
// dans une session Playwright
await page.goto('https://www.bybit.com/fr-FR/trade/spot/BTC/USDT');
await page.waitForTimeout(3000); // laisser le WS se connecter

// extraire les couleurs calculées d'un élément précis
const styles = await page.$eval('.orderbook-row-ask', el => {
  const cs = getComputedStyle(el);
  return { bg: cs.backgroundColor, color: cs.color, font: cs.fontFamily };
});
```

Combine ça avec un screenshot full-page (`page.screenshot({fullPage:true})`) pour avoir la référence visuelle exacte à côté de cette spec textuelle.

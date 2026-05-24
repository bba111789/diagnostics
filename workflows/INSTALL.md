# BrainStorm | Bi — Pipeline NBI v1.2
## Guide d'Installation Rapide

---

## PRÉREQUIS

- Hermes Agent v0.14.0+ (mise à jour faite)
- 5 profils workers créés
- Outilset kanban activé sur l'orchestrateur

---

## INSTALLATION EN 10 MINUTES

### 1. Créer les 5 profiles

```bash
# Profile crawler (m27 = MiniMax)
hermes profile create nbi-crawler \
  --description "Crawl et extraction données brutes pour diagnostic NB BrainStorm | Bi" \
  --no-skills

# Profile analyzer (kimi-2.5 = Moonshot)
hermes profile create nbi-analyzer \
  --description "Analyse, scoring 6 axes et rédaction complète pour diagnostic NB BrainStorm | Bi" \
  --no-skills

# Profile style-guard (kimi-2.5 = Moonshot)
hermes profile create nbi-style-guard \
  --description "Contrôle qualité stylistique anti-IA pour diagnostics NB BrainStorm | Bi" \
  --no-skills

# Profile validator (kimi-k2.5 = Moonshot)
hermes profile create nbi-validator \
  --description "Contrôle qualité technique et cohérence pour diagnostics NB BrainStorm | Bi" \
  --no-skills

# Profile builder (kimi-k2.5 = Moonshot)
hermes profile create nbi-builder \
  --description "Génération HTML standalone pour diagnostic NB BrainStorm | Bi" \
  --no-skills
```

### 2. Configurer les modèles

```bash
# Pour chaque profile kimi-k2.5
hermes -p nbi-analyzer model
# Choisir: moonshot > kimi-k2.5

hermes -p nbi-style-guard model
# Choisir: moonshot > kimi-k2.5

hermes -p nbi-validator model
# Choisir: moonshot > kimi-k2.5

hermes -p nbi-builder model
# Choisir: moonshot > kimi-k2.5

# Profile crawler (m27 = MiniMax)
hermes -p nbi-crawler model
# Choisir: minimax > m27
```

### 3. Configurer les toolsets

```yaml
# ~/.hermes/profiles/nbi-crawler/config.yaml
model:
  provider: minimax
  default: m27
toolsets:
  - web
```

```yaml
# ~/.hermes/profiles/nbi-analyzer/config.yaml
model:
  provider: moonshot
  default: kimi-k2.5
toolsets:
  - terminal
  - file
```

```yaml
# ~/.hermes/profiles/nbi-style-guard/config.yaml
model:
  provider: moonshot
  default: kimi-k2.5
toolsets:
  - terminal
  - file
```

```yaml
# ~/.hermes/profiles/nbi-validator/config.yaml
model:
  provider: moonshot
  default: kimi-k2.5
toolsets:
  - terminal
  - file
```

```yaml
# ~/.hermes/profiles/nbi-builder/config.yaml
model:
  provider: moonshot
  default: kimi-k2.5
toolsets:
  - terminal
  - file
  - web

terminal:
  cwd: /home/bsbi/projects/skill-converter/outputs/
```

### 4. Activer Kanban sur le profile default (orchestrateur)

```yaml
# ~/.hermes/profiles/default/config.yaml (ajouter)
toolsets:
  - kanban
  - terminal
  - file
  - delegation
```

### 5. Créer le répertoire de sortie

```bash
mkdir -p ~/projects/skill-converter/outputs/
```

---

## VÉRIFICATION

```bash
hermes profile list
# Doit afficher:
#   default
#   nbi-crawler
#   nbi-analyzer
#   nbi-style-guard
#   nbi-validator
#   nbi-builder
```

---

## TEST : PREMIER DIAGNOSTIC

```bash
hermes -p default
```

Taper :
```
Diagnostic A https://www.brainstormbi.com cc:b.barandas@brainstormbi.com
```

L'orchestrateur doit créer les 5 tâches Kanban liées.

---

## PROTECTION PIN (APRÈS RODAGE)

```bash
hermes -p nbi-crawler curator pin nbi-crawler
hermes -p nbi-analyzer curator pin nbi-analyzer
hermes -p nbi-style-guard curator pin nbi-style-guard
hermes -p nbi-validator curator pin nbi-validator
hermes -p nbi-builder curator pin nbi-builder
```

Le Curator tourne automatiquement toutes les 7 jours.
Sans pin, il peut réécrire ou supprimer les skills métier.
Avec pin : améliorations à la marge uniquement, pas de suppression.

---

## RODAGE RECOMMANDÉ

1. **5-10 diagnostics réels** sur des agences que tu connais
2. Vérifier manuellement la qualité de chaque 输出
3. Ajuster les prompts si nécessaire
4. **Puis** batch de 50+

---

## COÛTS ESTIMÉS

| Agent | Modèle | Coût/diag |
|-------|--------|-----------|
| Crawler | m27 | € |
| Analyzer | kimi-k2.5 | €€ |
| Style-guard | kimi-k2.5 | €€ |
| Validator | kimi-k2.5 | €€ |
| Builder | kimi-k2.5 | €€ |
| Escalade | kimi-k2.6 | €€€€ |

**Budget moyen :** ~€€€-€€€€ par diagnostic
**Avec escalade 20% :** ~€€€€-€€€€€ par diagnostic

---

## FONCTIONNALITÉS CLÉS

| Fonctionnalité | Agent | Description |
|----------------|-------|-------------|
| Heartbeat | Crawler | Toutes les 30s pour éviter zombie tasks |
| URLs fallback | Crawler | /about, /a-propos, /services, /prestations... |
| Anti-boucle | Style-guard | MAX 1 escalade kimi-2.6, HARD STOP à 2 passes |
| Validation HTML | Builder | Vérification post-génération (>500 lignes, CC_EMAILS, ITEMS, Chart.js) |
| GAS URL | Builder | localStorage.getItem('gas_url') prioritaire, panneau configurable |

---

## PROBLÈMES COURANTS

| Symptôme | Solution |
|----------|----------|
| Tasks non créées | Vérifier outilsets kanban sur default |
| Erreur modèle | `hermes -p [profile] model` pour reconfigurer |
| HTML non généré | Vérifier `/mnt/user-data/outputs/` permissions |
| Style trop "IA" | Ajuster prompt nbi-style-guard |

---

## FICHIERS

```
workflows/
├── 00-orchestrator.md     # Profile par défaut / batch launcher
├── 01-nbi-crawler.md      # Agent 1 : crawl
├── 02-nbi-analyzer.md     # Agent 2 : analyse + rédaction
├── 03-nbi-style-guard.md  # Agent 3 : contrôle style
├── 04-nbi-validator.md    # Agent 4 : validation technique
├── 05-nbi-builder.md       # Agent 5 : génération HTML
└── INSTALL.md             # Ce fichier
```
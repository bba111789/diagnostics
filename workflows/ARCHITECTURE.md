# BrainStorm | Bi — Pipeline NBI v1.2
## Architecture Multi-Agents Complète

---

## RÉSUMÉ EXÉCUTIF

Pipeline de génération de diagnostics New Business Intelligence pour BrainStorm | Bi.
5 agents spécialisés coordonnés via Kanban Hermes.
Sortie : fichiers HTML standalone prêts pour cold email.

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    BATCH LAUNCHER (default)                     │
│                    m27 + Kanban toolset                        │
│  - Parse Diagnostic A/B                                        │
│  - Crée 5 tâches Kanban par diagnostic                        │
│  - kanban_link pour dépendances                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  [slug] · Crawler                                              │
│  Profile: nbi-crawler                                          │
│  Modèle: m27 (MiniMax)                                         │
│  Toolset: web                                                   │
│  Mission: Crawl site, extraire données brutes                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  [slug] · Analyzer                                              │
│  Profile: nbi-analyzer                                         │
│  Modèle: kimi-2.5 (Moonshot)                                   │
│  Toolset: terminal, file                                       │
│  Mission: Scoring 6 axes, rédaction contenu                    │
│  ⚠️ Coût: €€                                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  [slug] · Style                                                 │
│  Profile: nbi-style-guard                                       │
│  Modèle: kimi-2.5 (Moonshot)                                   │
│  Toolset: terminal, file                                        │
│  Mission: Contrôle qualité stylistique anti-IA                 │
│  Score: 0-10                                                    │
│  Escalade: kimi-2.6 si score < 8 ou cas complexe               │
│  ⚠️ Coût: €€                                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────────────────┐
                    │  Score ≥ 8 OU escalade kimi-2.6 │
                    │  complétée                      │
                    └────────────────┬────────────────┘
                                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  [slug] · Validator                                             │
│  Profile: nbi-validator                                        │
│  Modèle: kimi-k2.5 (Moonshot)                                  │
│  Toolset: terminal, file                                        │
│  Mission: Validation technique + cohérence                     │
│  Rejet: kanban_block + renvoi                                   │
│  OK: kanban_complete → builder                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  [slug] · Builder                                               │
│  Profile: nbi-builder                                           │
│  Modèle: kimi-k2.5 (Moonshot) [CODE ONLY]                       │
│  Toolset: terminal, file                                        │
│  terminal.cwd: /home/bsbi/projects/skill-converter/outputs/                    │
│  Mission: Génération HTML standalone                           │
│  Sortie: [slug].html                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## MODÈLES UTILISÉS

| Provider | Modèle | Usage | Coût relatif |
|----------|--------|-------|--------------|
| **MiniMax** | m27 | Crawler, Validator, Builder | € |
| **Moonshot** | kimi-2.5 | Analyzer, Style-guard | €€ |
| **Moonshot** | kimi-2.6 | Escalade cas complexes | €€€€ |

---

## PROCESSUS D'ESCALADE

```
Style-guard (kimi-2.5)
        │
   Score ≥ 8 ────────→ VALIDATOR
        │
   Score < 8 OU
   cas complexe
        │
        ↓
   Escalade kimi-2.6
   (MAX 1× par diag)
        │
        ↓
   Style-guard PASS 2
   (kimi-2.5)
        │
   Score ≥ 8 ────────→ VALIDATOR
        │
   Score < 8
        │
        ↓
   HARD STOP
   Flag: a_reviser
   → VALIDATOR
```

**Cas d'escalade obligatoire (sans scoring) :**
- Secteur : Banque / Finance / Industrie
- Langue : Site uniquement en anglais
- Score global crawler < 70
- One-pager ou site vide

---

## FLUX DE DONNÉES

### Étape 1 : Crawler → Analyzer
```json
{
  "mode": "A|B",
  "url1": "...",
  "url2": "...",
  "cc_emails": [...],
  "profil_agence": {...},
  "donnees_prospect": {...}
}
```

### Étape 2 : Analyzer → Style-guard
```json
{
  "score_global": 75,
  "fiches_axes": [...],
  "verbatims": [...],
  "suggestions": [...],
  "plan": [...],
  "signal_wow": "..."
}
```

### Étape 3 : Style-guard → Validator
```json
{
  "style_score": 8.5,
  "verdict": "PASS",
  "scores_par_section": {
    "axe1": { "score": 9, "reparable": true },
    "axe2": { "score": 5, "reparable": false },
    ...
  },
  "escalade_kimi26": false,
  "sections_non_reparables": [],
  "sections_reparables": ["axe1", "axe3"]
}
```

### Étape 4 : Validator → Builder
```json
{
  "valid": true,
  "checks": {...},
  "a_reviser": false
}
```

### Étape 5 : Builder output
```
/home/bsbi/projects/skill-converter/outputs/[slug].html
```

---

## GESTION DES ERREURS

| Agent | Erreur | Action |
|-------|--------|--------|
| Crawler | 403/timeout + URLs multiples | web_search fallback + heartbeat |
| Analyzer | Données insuffisantes | Score minimum, noter anomalies |
| Style | Score < 6 | Escalade kimi-2.6 |
| Validator | Rejet | kanban_block + commentaire + renvoi |
| Builder | Erreur HTML | Retry MAX 1×, puis flag erreur |

---

## PROTECTION & MAINTENANCE

### Pin obligatoire après rodage
```bash
hermes -p nbi-crawler curator pin nbi-crawler
hermes -p nbi-analyzer curator pin nbi-analyzer
hermes -p nbi-style-guard curator pin nbi-style-guard
hermes -p nbi-validator curator pin nbi-validator
hermes -p nbi-builder curator pin nbi-builder
```

### Rodage
- 5-10 diagnostics réels AVANT batch de 50
- Vérification manuelle qualité
- Ajustement prompts si nécessaire

---

## COÛTS PAR DIAGNOSTIC

| Scénario | Agents kimi-2.5 | kimi-2.6 | Coût moyen |
|----------|-----------------|----------|------------|
| Standard (80%) | 2× | 0× | €€€ |
| Complexe (20%) | 2× | 1× | €€€€€ |

---

## VERSIONNEMENT

| Version | Date | Changements |
|---------|------|-------------|
| v1.0 | - | Pipeline Claude original (4 agents) |
| v1.1 | - | Proposition Claude |
| v1.2 | 2026-05-23 | + nbi-style-guard, escalade kimi-2.6, anti-boucle |

---

## CONTACT

BrainStorm | Bi
b.barandas@brainstormbi.com
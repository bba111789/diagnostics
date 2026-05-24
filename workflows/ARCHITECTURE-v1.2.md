# BrainStorm | Bi — Pipeline NBI v1.2
## Architecture Multi-Agents Optimisée

---

## ARCHITECTURE RECOMMANDÉE — 5 AGENTS

```
[BATCH LAUNCHER] → crée les tâches Kanban
        ↓
[nbi-crawler]    → collecte données brutes
        ↓
[nbi-analyzer]   → scoring, rédaction contenu
        ↓
[nbi-style-guard]→ contrôle qualité stylistique (ANTI-IA)
        ↓
[nbi-validator] → contrôle qualité technique + cohérence
        ↓
[nbi-builder]    → génération HTML standalone
```

---

## COMPARATIF : V1.1 (Claude) vs V1.2 (Optimisé)

| Aspect | V1.1 (Claude) | V1.2 (Optimisé) |
|--------|---------------|-----------------|
| Agents | 4 | 5 (+ style-guard) |
| Batch | Kanban basique | Kanban avec contexte enrichi |
| Style IA | Non traité | Agent dédié |
| Gestion erreurs | Basique | Sophistiquée avec contexte |
| Modèle Analyzer | kimi-k2.5 | m27 (analyse) + kimi (style) |

---

## OPTIMISATIONS CLÉ

### 1. AGENT NOUVEAU : nbi-style-guard
Ajouté pour éliminer :
- Phrases toutes faites / templates
- Superlatifs exagérés
- Vocabulaire "agency-speak" (buzzwords)
- Structures répétitives
- Ton condescendant

### 2. PIPELINE ENRICHIE
Chaque agent reçoit :
- Contexte complet du diagnostic
- Historique des décisions
- Flags de compatibilité croisée

### 3. CONTRÔLE CROSS-AGENT
- Style-guard vérifie les 6 fiches axes
- Validator vérifie la sortie HTML
- Builder ne peut pas corriger le style (delegation)

### 4. GESTION D'ERREURS AMÉLIORÉE
- Reprise ciblée par agent
- Pas de recomplétion totale
- Logs structurés avec contexte

---

## AGENTS DÉTAILLÉS

Voir documents agents dans /workflows/
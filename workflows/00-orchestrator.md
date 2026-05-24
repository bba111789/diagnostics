# ORCHESTRATEUR — Batch Launcher
## BrainStorm | Bi — Pipeline NBI v1.2

---

## RÔLE

L'orchestrateur est le profil **default** ou un profil dédié qui :
1. Reçoit les commandes de batch (Diagnostic A / Diagnostic B)
2. Parse les URLs et paramètres
3. Crée les 5 tâches Kanban liées pour chaque diagnostic
4. Supervise le pipeline

---

## PROFILE CREATION (optionnel)

```bash
hermes profile create nbi-orchestrator \
  --description "Orchestrateur batch diagnostics NB BrainStorm | Bi" \
  --clone
```

Ou utiliser le profil **default** existant.

---

## CONFIGURATION

```yaml
# ~/.hermes/profiles/nbi-orchestrator/config.yaml
# ou ~/.hermes/profiles/default/config.yaml

toolsets:
  - kanban
  - terminal
  - file
  - delegation
```

---

## FORMAT DE COMMANDE BATCH

### Diagnostic A — leads seuls
```
Diagnostic A
[URL_lead1] [contexte optionnel] [cc: email1@x.com, email2@x.com]
[URL_lead2] [contexte optionnel]
[URL_lead3] [contexte optionnel] [cc: email3@x.com]
```

### Diagnostic B — agence émettrice fixe + leads
```
Diagnostic B [URL_agence_emettrice]
[URL_lead1] [contexte optionnel] [cc: email1@x.com, email2@x.com]
[URL_lead2] [contexte optionnel]
[URL_lead3] [contexte optionnel]
```

---

## PROCESSUS DE CRÉATION DES TÂCHES

Pour CHAQUE ligne de diagnostic :

### 1. Créer la tâche Crawler
```
kanban_create:
  title: "[slug] · Crawler"
  lane: "nbi-pipeline"
  description: "Crawl et extraction données pour [nom cible]\nMode: A|B\nURL: [url]\ncc_emails: [...]"
```

### 2. Créer la tâche Analyzer
```
kanban_create:
  title: "[slug] · Analyzer"
  lane: "nbi-pipeline"
  description: "Analyse et scoring pour [nom cible]\nEn attente des données crawler."
```

### 3. Créer la tâche Style-guard
```
kanban_create:
  title: "[slug] · Style"
  lane: "nbi-pipeline"
  description: "Contrôle qualité stylistique pour [slug]"
```

### 4. Créer la tâche Validator
```
kanban_create:
  title: "[slug] · Validator"
  lane: "nbi-pipeline"
  description: "Validation technique pour [slug]"
```

### 5. Créer la tâche Builder
```
kanban_create:
  title: "[slug] · Builder"
  lane: "nbi-pipeline"
  description: "Génération HTML pour [slug]\nSortie: /home/bsbi/projects/skill-converter/outputs/[slug].html"
```

### 6. Heartbeat crawler (optionnel)
Après création de la tâche Crawler, envoyer un premier heartbeat :
```
kanban_heartbeat: [crawler_task_id]
```

### 7. Lier les dépendances
```
kanban_link: "Crawler" → "Analyzer"
kanban_link: "Analyzer" → "Style"
kanban_link: "Style" → "Validator"
kanban_link: "Validator" → "Builder"
```

---

## CONVENTION DE NOMAGE

| Tâche | Format nom | Profile worker |
|-------|-----------|---------------|
| Crawler | `[slug] · Crawler` | nbi-crawler |
| Analyzer | `[slug] · Analyzer` | nbi-analyzer |
| Style | `[slug] · Style` | nbi-style-guard |
| Validator | `[slug] · Validator` | nbi-validator |
| Builder | `[slug] · Builder` | nbi-builder |

**Slug** : minuscules, espaces → tirets, accents supprimés, **JAMAIS préfixe "diagnostic-"**

---

## PARSING DES LIGNES

### Extraction URL
```regex
https?://[^\s\[\]]+
```

### Extraction cc_emails
```regex
cc:\s*([^\]]+)
```

### Extraction contexte libre
```regex
[URL]\s+([^\[\]]+?)(?:\s+cc:|$)
```

### Génération slug
```python
slug = nom_domaine.lower().replace(' ', '-').replace('.', '-')
# Exemple: "https://www.brainstorm-agence.com" → "brainstorm-agence"
```

---

## LOG DE CRÉATION

```
── LOG BATCH ──────────────────────
Mode       : A | B
Agence     : [nom] (Mode B)
Leads      : [n]
Tâches crées: 5 × [n]
CC emails  : [listes]
───────────────────────────────────
```

---

## EXEMPLE DE CONVERSATION

**User:**
```
Diagnostic B https://www.agence-exemple.com
https://www.prospect-1.com cc:contact@exemple.com
https://www.prospect-2.com
```

**Orchestrateur:**
```
→ Parsing Batch Mode B
→ Agence émettrice: www.agence-exemple.com
→ Lead 1: www.prospect-1.com (CC: contact@exemple.com)
→ Lead 2: www.prospect-2.com (CC: none)

Création des tâches pour 2 diagnostics...
✓ Tâches créées et liées
```

---

## SURVEILLANCE

### Heartbeat automatique
Vérifier périodiquement les tâches actives :
```
kanban_list: lane=nbi-pipeline
```
Détecter les tâches sans activité récente (>5min) et relancer si nécessaire.

### Reprendre après блокировка
```
kanban_unblock: [task_id]
```

### Forcer reprise
```
kanban_complete: [task_id]
kanban_link: [précédent] → [task_id]
```
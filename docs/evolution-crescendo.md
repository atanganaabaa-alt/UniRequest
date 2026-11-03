# Évolution crescendo du travail — UniRequest

**Building Team Project** · Application de gestion des requêtes dans une institution universitaire  
**Équipe :** Atangana Sara · Neh Ngapouh · Maffo Daniel · Sibefeu Luc · Wome Franck · Emma Nkot  
**Période :** sessions 1 à 6

Le travail n’est pas resté plat. Chaque séance a **ajouté une couche** : d’abord le cadre, puis le besoin, puis la structure, puis le logiciel, puis la qualité, puis la livraison. Les six membres avancent ensemble ; l’ampleur de ce qui est produit augmente d’une session à l’autre.

---

## Vue d’ensemble (crescendo)

| Session | Niveau d’avancement | Ce que l’équipe tient dans les mains |
| --- | --- | --- |
| 1 | Fondations | Charte, rôles, dépôt, problème formulé |
| 2 | Besoin | Personas, 12 user stories, maquettes |
| 3 | Structure | UML, schéma de données, squelette qui démarre |
| 4 | Produit | Dépôt réel, rôles, transitions, file agent |
| 5 | Confiance | Tests, revue croisée, journal d’audit |
| 6 | Livraison | Démo 12 min, rapport, tag `session-6` |

---

## Session 1 — On existe en tant qu’équipe

**Crescendo : de six personnes à une équipe.**

- **Atangana Sara.** Pose le périmètre : UniRequest, pas tout le SI. Fige les rôles, les comptes de démo, la règle « on enlève une story plutôt que six demi-features ». Rédige la première version de la charte.
- **Neh Ngapouh.** Écrit le problème institutionnel (files d’attente, courriels perdus, pièces introuvables). Dresse la carte des parties prenantes : étudiant, scolarité, chef de département, DSI.
- **Maffo Daniel.** Propose le dépôt unique, les branches `main` / `dev`, la convention de commits (`feat`, `fix`, `docs`, `test`, `chore`).
- **Sibefeu Luc.** Crée le tableau Kanban (À faire / En cours / Revue / Terminé) et les premières cartes d’outillage.
- **Wome Franck.** Insère dans la charte la définition de « Terminé » : pas fini sans critère d’acceptation. Liste les risques (stack, SMTP, story trop grosse).
- **Emma Nkot.** Rédige le README initial (noms, vision, équipe) pour qu’un tiers comprenne le projet en une page.

**Livrable session 1 :** dépôt, tableau, charte signée des six prénoms.

---

## Session 2 — Le besoin devient visible

**Crescendo : du problème aux stories testables.**

- **Neh Ngapouh.** Personas Amina (L3, téléphone, concours dans 6 jours), M. Owona (80 dossiers/jour), Dr. Fotso (recours le jeudi). Formule 12 user stories US-01 à US-12.
- **Atangana Sara.** Applique MoSCoW : au plus 7 Must pour les six sessions. Gèle le hors-périmètre (paiement, appli native, interconnexion complète du SI).
- **Emma Nkot.** Réécrit les libellés d’écran des Must : titres et boutons compréhensibles par un étudiant, pas du jargon technique.
- **Sibefeu Luc.** Maquettes des six écrans Must (connexion, dépôt, liste, détail, file agent, décision chef) dans `docs/maquettes/`.
- **Wome Franck.** Barre toute story dont un critère n’est pas observable. Exige le format Étant donné / Quand / Alors.
- **Maffo Daniel.** Vérifie que chaque Must a une implication données (utilisateur, type, requête, pièce, événement) — encore sans coder le schéma.

**Livrable session 2 :** backlog outillé + maquettes versionnées.

---

## Session 3 — La structure tient debout

**Crescendo : des dessins à un logiciel qui démarre.**

- **Maffo Daniel.** Fige la stack : API Node, persistance, frontend web. Modèle : Utilisateur, TypeRequete, Requete, PieceJointe, Evenement. Seed : 5 comptes, 4 types, requêtes d’exemple.
- **Neh Ngapouh.** Valide les cas d’utilisation et les règles : délais, pièces selon le type, chef = recours seulement.
- **Sibefeu Luc.** Squelette d’interface : navigation aux noms définitifs des écrans, page « ça tourne ».
- **Emma Nkot.** README de lancement en dix lignes (prérequis, `npm install`, `npm start`, ports).
- **Wome Franck.** Commande `npm test` verte (même minimale) comme critère d’entrée des séances suivantes.
- **Atangana Sara.** Date la décision d’architecture : plus de changement de framework après la session 3.

**Livrable session 3 :** un camarade clone et démarre en suivant le README seulement.

---

## Session 4 — Le produit se voit

**Crescendo : du squelette à un parcours métier réel.**

Objectif de sprint : *Amina se connecte, dépose un relevé, le voit en « Soumise ». Owona le prend en charge. Fotso ne voit que les recours. Un étudiant qui joue l’agent est refusé.*

- **Sibefeu Luc.** Écrans étudiant (formulaire, liste, détail) et file agent (assigner, changer d’état).
- **Maffo Daniel.** API création, liste filtrée, actions, codes 403. Contrôle des droits **côté serveur**.
- **Neh Ngapouh.** Types de requêtes et pièces obligatoires dans les données, pas seulement sur la maquette.
- **Atangana Sara.** Tient le sprint : tickets Must en revue en fin de séance, démo interne de 5 minutes.
- **Emma Nkot.** États vides, messages d’erreur en français métier (« En cours de traitement », pas `EN_COURS`).
- **Wome Franck.** Smoke manuel Amina / Owona. Signale tout bouton qui « a l’air de marcher » sans règle serveur.

**Livrable session 4 :** incrément démontrable, pas six couches invisibles.

---

## Session 5 — On peut faire confiance

**Crescendo : du « ça marche en démo » à la preuve.**

- **Wome Franck.** Tests du moteur d’états : soumission sans pièce, auto-validation interdite, chef hors recours, chef sur recours. Journal d’exécution des 12 cas du plan de test.
- **Maffo Daniel.** Chaque transition écrit un `Evenement` (qui, quand, action, commentaire).
- **Sibefeu Luc.** Affiche l’historique sur l’écran détail.
- **Atangana Sara.** Revue croisée obligatoire : chacun relit un merge qui n’est pas le sien. Décide ce qui bloque la session 6.
- **Neh Ngapouh.** Vérifie que B4 (pas d’auto-validation) et B5 (trace horodatée) n’ont aucun trou dans la matrice besoin → test.
- **Emma Nkot.** Relit les commentaires d’audit pour qu’un agent comprenne la décision six mois plus tard.

**Livrable session 5 :** suite de tests + historique visible + anomalies ouvertes.

---

## Session 6 — On livre

**Crescendo : de la confiance à la parole publique.**

- **Atangana Sara.** Clôt le périmètre, joue l’ouverture et la clôture de la démo (problème, hors-périmètre, questions). Timeboxe la rétrospective.
- **Neh Ngapouh.** Présente acteurs et types de requêtes en 90 secondes, avec le logiciel ouvert, pas un discours abstrait.
- **Sibefeu Luc et Emma Nkot.** Parcours étudiant (3 min) : dépôt, suivi, pièce. Manuel d’une page (étudiant / agent / chef).
- **Maffo Daniel.** Parcours agent / chef et audit (3 min). Tag Git `session-6`.
- **Wome Franck.** Montre un test qui protège une règle critique (auto-validation). Verdict qualité dans le rapport.
- **Les six.** Rétrospective : garder / changer / essayer. Rapport d’équipe : vision, architecture, livré / reporté, rôles réellement tenus.

**Livrable session 6 :** application démontrable, README, manuel, rapport, résidus listés. Les six noms figurent sur la page de garde.

---

## Ce que chacun a fait monter en puissance

| Membre | Session 1 | Session 6 |
| --- | --- | --- |
| **Atangana Sara** | Charte et priorités | Arbitrage de livraison et conduite de la démo |
| **Neh Ngapouh** | Problème et parties prenantes | Besoin incarné dans les types, les règles et l’oral |
| **Maffo Daniel** | Dépôt Git | API, états, audit, tag de release |
| **Sibefeu Luc** | Kanban | Parcours complet étudiant / agent |
| **Wome Franck** | Définition de « Terminé » | Preuve par les tests et go/no-go |
| **Emma Nkot** | README | Manuel, textes d’interface, clarté de la démo |

Le crescendo n’est pas qu’une addition de lignes de code : c’est le passage d’une intention partagée à un service que Amina et Owona peuvent utiliser sans qu’on parle à leur place.

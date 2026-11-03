# UniRequest

Application de gestion des requêtes dans une institution universitaire.

Équipe : Atangana Sara, Neh Ngapouh, Maffo Daniel, Sibefeu Luc, Wome Franck, Emma Nkot.

## Lancer

```bash
npm install
npm test
npm start
```

Ouvrir [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Comptes de démonstration

| Personne | Courriel | Mot de passe | Rôle |
| --- | --- | --- | --- |
| Amina Ngo | amina@campus.cm | etudiant | Étudiante |
| Jean Mbarga | jean@campus.cm | etudiant | Étudiant |
| M. Owona | owona@campus.cm | agent | Scolarité |
| Dr. Fotso | fotso@campus.cm | chef | Chef de département |
| Admin Campus | admin@campus.cm | admin | Administration |

## Règles métier

- Workflow : brouillon → soumise → en cours → validée / rejetée / pièce manquante.
- Un demandeur ne peut pas valider sa propre requête.
- Le chef de département ne vise que les recours de notes.
- Chaque action écrit un événement d’audit.

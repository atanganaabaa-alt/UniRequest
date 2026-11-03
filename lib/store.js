"use strict";

const fs = require("fs");
const path = require("path");
const { ETATS, ROLES } = require("./workflow");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

function now() {
  return new Date().toISOString();
}

function seed() {
  const users = [
    {
      id: "u-amina",
      nom: "Amina Ngo",
      email: "amina@campus.cm",
      password: "etudiant",
      role: ROLES.ETUDIANT,
      departement: "Informatique",
      titre: "Étudiante L3",
    },
    {
      id: "u-jean",
      nom: "Jean Mbarga",
      email: "jean@campus.cm",
      password: "etudiant",
      role: ROLES.ETUDIANT,
      departement: "Informatique",
      titre: "Étudiant M1",
    },
    {
      id: "u-owona",
      nom: "M. Owona",
      email: "owona@campus.cm",
      password: "agent",
      role: ROLES.AGENT,
      departement: "Scolarité",
      titre: "Agent de scolarité",
    },
    {
      id: "u-fotso",
      nom: "Dr. Fotso",
      email: "fotso@campus.cm",
      password: "chef",
      role: ROLES.CHEF,
      departement: "Informatique",
      titre: "Chef de département",
    },
    {
      id: "u-admin",
      nom: "Admin Campus",
      email: "admin@campus.cm",
      password: "admin",
      role: ROLES.ADMIN,
      departement: "DSI",
      titre: "Administratrice",
    },
  ];

  const types = [
    {
      code: "RELEVE",
      libelle: "Relevé de notes",
      service: "Scolarité",
      delaiJours: 5,
      pieces: "Carte d’étudiant (PDF ou image)",
    },
    {
      code: "ATTESTATION",
      libelle: "Attestation de scolarité",
      service: "Scolarité",
      delaiJours: 3,
      pieces: "Carte d’étudiant",
    },
    {
      code: "RECOURS",
      libelle: "Recours de note",
      service: "Département",
      delaiJours: 10,
      pieces: "Copie de la copie / relevé contesté",
    },
    {
      code: "SALLE",
      libelle: "Réservation de salle",
      service: "Patrimoine",
      delaiJours: 2,
      pieces: "Motif et créneau souhaité (PDF)",
    },
  ];

  const requetes = [
    {
      id: "REQ-2026-0001",
      numero: 1,
      typeCode: "ATTESTATION",
      demandeurId: "u-amina",
      assigneId: "u-owona",
      etat: ETATS.VALIDEE,
      motif: "Dossier de bourse — attestation de scolarité 2026-2027.",
      pieces: [{ nom: "carte-amina.pdf", type: "application/pdf", tailleKo: 220 }],
      createdAt: "2026-10-12T08:10:00.000Z",
      updatedAt: "2026-10-14T16:40:00.000Z",
    },
    {
      id: "REQ-2026-0002",
      numero: 2,
      typeCode: "RELEVE",
      demandeurId: "u-amina",
      assigneId: "u-owona",
      etat: ETATS.EN_COURS,
      motif: "Relevé de L3 pour un concours dans six jours.",
      pieces: [{ nom: "carte-etudiant.jpg", type: "image/jpeg", tailleKo: 540 }],
      createdAt: "2026-10-20T09:00:00.000Z",
      updatedAt: "2026-10-21T11:20:00.000Z",
    },
    {
      id: "REQ-2026-0003",
      numero: 3,
      typeCode: "RECOURS",
      demandeurId: "u-jean",
      assigneId: "u-fotso",
      etat: ETATS.SOUMISE,
      motif: "Contestation de la note de Compilation (session de septembre).",
      pieces: [{ nom: "copie-compilation.pdf", type: "application/pdf", tailleKo: 1100 }],
      createdAt: "2026-10-22T14:00:00.000Z",
      updatedAt: "2026-10-22T14:05:00.000Z",
    },
    {
      id: "REQ-2026-0004",
      numero: 4,
      typeCode: "SALLE",
      demandeurId: "u-jean",
      assigneId: null,
      etat: ETATS.INCOMPLETE,
      motif: "Salle B12, samedi 1er novembre, club robotique.",
      pieces: [{ nom: "demande-club.pdf", type: "application/pdf", tailleKo: 80 }],
      createdAt: "2026-10-18T10:00:00.000Z",
      updatedAt: "2026-10-19T09:30:00.000Z",
    },
  ];

  const evenements = [
    { id: "ev-1", requeteId: "REQ-2026-0001", acteurId: "u-amina", action: "SOUMETTRE", commentaire: "Dépôt initial", at: "2026-10-12T08:12:00.000Z", etat: ETATS.SOUMISE },
    { id: "ev-2", requeteId: "REQ-2026-0001", acteurId: "u-owona", action: "ASSIGNER", commentaire: "Prise en charge scolarité", at: "2026-10-13T09:00:00.000Z", etat: ETATS.EN_COURS },
    { id: "ev-3", requeteId: "REQ-2026-0001", acteurId: "u-owona", action: "VALIDER", commentaire: "Attestation générée", at: "2026-10-14T16:40:00.000Z", etat: ETATS.VALIDEE },
    { id: "ev-4", requeteId: "REQ-2026-0002", acteurId: "u-amina", action: "SOUMETTRE", commentaire: "Urgent concours", at: "2026-10-20T09:02:00.000Z", etat: ETATS.SOUMISE },
    { id: "ev-5", requeteId: "REQ-2026-0002", acteurId: "u-owona", action: "ASSIGNER", commentaire: "Dossier relevé", at: "2026-10-21T11:20:00.000Z", etat: ETATS.EN_COURS },
    { id: "ev-6", requeteId: "REQ-2026-0003", acteurId: "u-jean", action: "SOUMETTRE", commentaire: "Recours Compilation", at: "2026-10-22T14:05:00.000Z", etat: ETATS.SOUMISE },
    { id: "ev-7", requeteId: "REQ-2026-0004", acteurId: "u-jean", action: "SOUMETTRE", commentaire: "Club robotique", at: "2026-10-18T10:04:00.000Z", etat: ETATS.SOUMISE },
    { id: "ev-8", requeteId: "REQ-2026-0004", acteurId: "u-owona", action: "ASSIGNER", commentaire: "Vérification créneau", at: "2026-10-18T15:00:00.000Z", etat: ETATS.EN_COURS },
    { id: "ev-9", requeteId: "REQ-2026-0004", acteurId: "u-owona", action: "DEMANDER_PIECE", commentaire: "Précisez l’horaire de fin et le nombre de participants.", at: "2026-10-19T09:30:00.000Z", etat: ETATS.INCOMPLETE },
  ];

  return { nextNumero: 5, users, types, requetes, evenements };
}

function load() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const initial = seed();
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function save(db) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_PATH);
}

function publicUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

function reset() {
  const initial = seed();
  save(initial);
  return initial;
}

module.exports = {
  DB_PATH,
  now,
  load,
  save,
  reset,
  publicUser,
  seed,
};

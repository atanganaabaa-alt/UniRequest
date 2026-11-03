"use strict";

const path = require("path");
const crypto = require("crypto");
const express = require("express");
const { prochainEtat, actionsPossibles, LIBELLES_ETAT, ROLES } = require("./lib/workflow");
const store = require("./lib/store");

const PORT = Number(process.env.PORT) || 3000;
const sessions = new Map();

function db() {
  return store.load();
}

function persist(data) {
  store.save(data);
}

function bearer(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : req.query.token;
  return sessions.get(token) || null;
}

function requireAuth(req, res, next) {
  const user = bearer(req);
  if (!user) {
    res.status(401).json({ message: "Connexion requise." });
    return;
  }
  req.user = user;
  next();
}

function visibleRequetes(data, user) {
  if (user.role === ROLES.ADMIN || user.role === ROLES.AGENT) return data.requetes;
  if (user.role === ROLES.CHEF) {
    return data.requetes.filter(
      (r) => r.typeCode === "RECOURS" && (r.etat !== "BROUILLON" || r.demandeurId === user.id)
    );
  }
  return data.requetes.filter((r) => r.demandeurId === user.id);
}

function enrich(data, requete, user) {
  const type = data.types.find((t) => t.code === requete.typeCode);
  const demandeur = data.users.find((u) => u.id === requete.demandeurId);
  const assigne = data.users.find((u) => u.id === requete.assigneId);
  const evenements = data.evenements
    .filter((e) => e.requeteId === requete.id)
    .sort((a, b) => a.at.localeCompare(b.at))
    .map((e) => ({
      ...e,
      acteur: store.publicUser(data.users.find((u) => u.id === e.acteurId)),
      etatLibelle: LIBELLES_ETAT[e.etat] || e.etat,
    }));
  return {
    ...requete,
    type,
    demandeur: store.publicUser(demandeur),
    assigne: store.publicUser(assigne),
    etatLibelle: LIBELLES_ETAT[requete.etat] || requete.etat,
    actions: actionsPossibles(requete, user),
    evenements,
  };
}

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};
  const data = db();
  const user = data.users.find(
    (u) => u.email.toLowerCase() === String(email || "").toLowerCase() && u.password === password
  );
  if (!user) {
    res.status(401).json({ message: "Identifiants incorrects." });
    return;
  }
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, store.publicUser(user));
  res.json({ token, user: store.publicUser(user) });
});

app.post("/api/logout", requireAuth, (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  sessions.delete(token);
  res.json({ ok: true });
});

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/comptes", (_req, res) => {
  const data = db();
  res.json(
    data.users.map((u) => ({
      email: u.email,
      password: u.password,
      nom: u.nom,
      role: u.role,
      titre: u.titre,
    }))
  );
});

app.get("/api/types", requireAuth, (_req, res) => {
  res.json(db().types);
});

app.get("/api/requetes", requireAuth, (req, res) => {
  const data = db();
  const liste = visibleRequetes(data, req.user).map((r) => enrich(data, r, req.user));
  res.json(liste);
});

app.get("/api/requetes/:id", requireAuth, (req, res) => {
  const data = db();
  const requete = visibleRequetes(data, req.user).find((r) => r.id === req.params.id);
  if (!requete) {
    res.status(404).json({ message: "Requête introuvable." });
    return;
  }
  res.json(enrich(data, requete, req.user));
});

app.post("/api/requetes", requireAuth, (req, res) => {
  const user = req.user;
  if (user.role !== ROLES.ETUDIANT && user.role !== ROLES.PERSONNEL && user.role !== ROLES.ADMIN) {
    res.status(403).json({ message: "Seuls un étudiant ou un membre du personnel peuvent déposer." });
    return;
  }
  const { typeCode, motif, pieces } = req.body || {};
  const data = db();
  const type = data.types.find((t) => t.code === typeCode);
  if (!type) {
    res.status(400).json({ message: "Type de requête inconnu." });
    return;
  }
  if (!String(motif || "").trim()) {
    res.status(400).json({ message: "Indiquez le motif de la demande." });
    return;
  }
  const fichiers = Array.isArray(pieces) ? pieces.slice(0, 5) : [];
  const numero = data.nextNumero;
  const id = `REQ-2026-${String(numero).padStart(4, "0")}`;
  const requete = {
    id,
    numero,
    typeCode,
    demandeurId: user.id,
    assigneId: null,
    etat: "BROUILLON",
    motif: String(motif).trim(),
    pieces: fichiers,
    createdAt: store.now(),
    updatedAt: store.now(),
  };
  data.nextNumero += 1;
  data.requetes.push(requete);
  data.evenements.push({
    id: `ev-${crypto.randomBytes(6).toString("hex")}`,
    requeteId: id,
    acteurId: user.id,
    action: "CREER",
    commentaire: "Brouillon créé",
    at: requete.createdAt,
    etat: requete.etat,
  });
  persist(data);
  res.status(201).json(enrich(data, requete, user));
});

app.post("/api/requetes/:id/actions", requireAuth, (req, res) => {
  const { action, commentaire, piece } = req.body || {};
  const data = db();
  const requete = data.requetes.find((r) => r.id === req.params.id);
  if (!requete) {
    res.status(404).json({ message: "Requête introuvable." });
    return;
  }
  const visible = visibleRequetes(data, req.user).some((r) => r.id === requete.id);
  if (!visible) {
    res.status(404).json({ message: "Requête introuvable." });
    return;
  }
  if (piece && piece.nom) {
    requete.pieces = requete.pieces || [];
    if (requete.pieces.length >= 5) {
      res.status(400).json({ message: "Cinq pièces maximum." });
      return;
    }
    requete.pieces.push(piece);
  }
  const resultat = prochainEtat(requete, action, req.user);
  if (!resultat.ok) {
    res.status(resultat.code).json({ message: resultat.message });
    return;
  }
  requete.etat = resultat.etat;
  requete.updatedAt = store.now();
  if (action === "ASSIGNER") requete.assigneId = req.user.id;
  data.evenements.push({
    id: `ev-${crypto.randomBytes(6).toString("hex")}`,
    requeteId: requete.id,
    acteurId: req.user.id,
    action,
    commentaire: String(commentaire || "").trim(),
    at: requete.updatedAt,
    etat: requete.etat,
  });
  persist(data);
  res.json(enrich(data, requete, req.user));
});

app.post("/api/reset", requireAuth, (req, res) => {
  if (req.user.role !== ROLES.ADMIN) {
    res.status(403).json({ message: "Réservé à l’administratrice." });
    return;
  }
  const data = store.reset();
  res.json({ ok: true, requetes: data.requetes.length });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

if (require.main === module) {
  app.listen(PORT, "127.0.0.1", () => {
    process.stdout.write(`UniRequest prêt sur http://127.0.0.1:${PORT}\n`);
  });
}

module.exports = { app };

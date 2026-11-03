"use strict";

const ETATS = {
  BROUILLON: "BROUILLON",
  SOUMISE: "SOUMISE",
  EN_COURS: "EN_COURS",
  INCOMPLETE: "INCOMPLETE",
  VALIDEE: "VALIDEE",
  REJETEE: "REJETEE",
  ARCHIVEE: "ARCHIVEE",
  ANNULEE: "ANNULEE",
};

const ROLES = {
  ETUDIANT: "ETUDIANT",
  PERSONNEL: "PERSONNEL",
  AGENT: "AGENT",
  CHEF: "CHEF",
  ADMIN: "ADMIN",
};

const ACTIONS = {
  SOUMETTRE: "SOUMETTRE",
  ASSIGNER: "ASSIGNER",
  VALIDER: "VALIDER",
  REJETER: "REJETER",
  DEMANDER_PIECE: "DEMANDER_PIECE",
  ANNULER: "ANNULER",
  ARCHIVER: "ARCHIVER",
};

const LIBELLES_ETAT = {
  BROUILLON: "Brouillon",
  SOUMISE: "Soumise",
  EN_COURS: "En cours de traitement",
  INCOMPLETE: "Pièce manquante",
  VALIDEE: "Validée",
  REJETEE: "Rejetée",
  ARCHIVEE: "Archivée",
  ANNULEE: "Annulée",
};

function estDemandeur(requete, acteur) {
  return requete.demandeurId === acteur.id;
}

function peutTraiterType(acteur, typeCode) {
  if (acteur.role === ROLES.ADMIN || acteur.role === ROLES.AGENT) return true;
  if (acteur.role === ROLES.CHEF) return typeCode === "RECOURS";
  return false;
}

function prochainEtat(requete, action, acteur) {
  if (!requete || !acteur) {
    return { ok: false, code: 400, message: "Requête ou acteur manquant." };
  }
  if (action === ACTIONS.VALIDER && estDemandeur(requete, acteur)) {
    return {
      ok: false,
      code: 403,
      message: "Un demandeur ne peut pas valider sa propre requête.",
    };
  }

  const etat = requete.etat;
  const role = acteur.role;
  const demandeur = estDemandeur(requete, acteur);

  if (etat === ETATS.BROUILLON && action === ACTIONS.SOUMETTRE && demandeur) {
    const pieces = requete.pieces || [];
    if (pieces.length < 1) {
      return { ok: false, code: 400, message: "Joignez au moins une pièce avant de soumettre." };
    }
    if (pieces.length > 5) {
      return { ok: false, code: 400, message: "Cinq pièces maximum." };
    }
    return { ok: true, etat: ETATS.SOUMISE };
  }

  if (etat === ETATS.BROUILLON && action === ACTIONS.ANNULER && demandeur) {
    return { ok: true, etat: ETATS.ANNULEE };
  }

  if (
    etat === ETATS.SOUMISE &&
    action === ACTIONS.ASSIGNER &&
    (role === ROLES.AGENT || role === ROLES.ADMIN || role === ROLES.CHEF)
  ) {
    if (!peutTraiterType(acteur, requete.typeCode)) {
      return { ok: false, code: 403, message: "Ce service ne traite pas ce type de requête." };
    }
    return { ok: true, etat: ETATS.EN_COURS };
  }

  if (etat === ETATS.SOUMISE && action === ACTIONS.REJETER && (role === ROLES.AGENT || role === ROLES.ADMIN || role === ROLES.CHEF)) {
    if (!peutTraiterType(acteur, requete.typeCode)) {
      return { ok: false, code: 403, message: "Vous n’êtes pas habilité à rejeter ce dossier." };
    }
    return { ok: true, etat: ETATS.REJETEE };
  }

  if (etat === ETATS.SOUMISE && action === ACTIONS.ANNULER && demandeur) {
    return { ok: true, etat: ETATS.ANNULEE };
  }

  if (etat === ETATS.EN_COURS && action === ACTIONS.VALIDER) {
    if (role !== ROLES.AGENT && role !== ROLES.ADMIN && role !== ROLES.CHEF) {
      return { ok: false, code: 403, message: "Seuls un agent, un chef ou un administrateur peuvent valider." };
    }
    if (!peutTraiterType(acteur, requete.typeCode)) {
      return { ok: false, code: 403, message: "Le chef de département ne vise que les recours de notes." };
    }
    return { ok: true, etat: ETATS.VALIDEE };
  }

  if (etat === ETATS.EN_COURS && action === ACTIONS.REJETER) {
    if (role !== ROLES.AGENT && role !== ROLES.ADMIN && role !== ROLES.CHEF) {
      return { ok: false, code: 403, message: "Action réservée au service compétent." };
    }
    if (!peutTraiterType(acteur, requete.typeCode)) {
      return { ok: false, code: 403, message: "Vous n’êtes pas habilité à rejeter ce dossier." };
    }
    return { ok: true, etat: ETATS.REJETEE };
  }

  if (etat === ETATS.EN_COURS && action === ACTIONS.DEMANDER_PIECE && (role === ROLES.AGENT || role === ROLES.ADMIN)) {
    return { ok: true, etat: ETATS.INCOMPLETE };
  }

  if (etat === ETATS.INCOMPLETE && action === ACTIONS.SOUMETTRE && demandeur) {
    return { ok: true, etat: ETATS.SOUMISE };
  }

  if ((etat === ETATS.VALIDEE || etat === ETATS.REJETEE) && action === ACTIONS.ARCHIVER && (role === ROLES.ADMIN || role === ROLES.AGENT)) {
    return { ok: true, etat: ETATS.ARCHIVEE };
  }

  return {
    ok: false,
    code: 409,
    message: `L’action ${action} n’est pas possible depuis l’état « ${LIBELLES_ETAT[etat] || etat} ».`,
  };
}

function actionsPossibles(requete, acteur) {
  return Object.values(ACTIONS).filter((action) => prochainEtat(requete, action, acteur).ok);
}

module.exports = {
  ETATS,
  ROLES,
  ACTIONS,
  LIBELLES_ETAT,
  prochainEtat,
  actionsPossibles,
  estDemandeur,
  peutTraiterType,
};

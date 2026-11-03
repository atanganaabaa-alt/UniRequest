"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { prochainEtat, ETATS, ACTIONS, ROLES } = require("../lib/workflow");

const amina = { id: "u-amina", role: ROLES.ETUDIANT };
const owona = { id: "u-owona", role: ROLES.AGENT };
const fotso = { id: "u-fotso", role: ROLES.CHEF };

describe("moteur d’états UniRequest", () => {
  it("refuse la soumission sans pièce", () => {
    const r = { demandeurId: "u-amina", etat: ETATS.BROUILLON, pieces: [], typeCode: "RELEVE" };
    const out = prochainEtat(r, ACTIONS.SOUMETTRE, amina);
    assert.equal(out.ok, false);
    assert.equal(out.code, 400);
  });

  it("soumet un brouillon avec pièce", () => {
    const r = {
      demandeurId: "u-amina",
      etat: ETATS.BROUILLON,
      pieces: [{ nom: "carte.pdf" }],
      typeCode: "RELEVE",
    };
    const out = prochainEtat(r, ACTIONS.SOUMETTRE, amina);
    assert.equal(out.ok, true);
    assert.equal(out.etat, ETATS.SOUMISE);
  });

  it("interdit l’auto-validation", () => {
    const r = { demandeurId: "u-owona", etat: ETATS.EN_COURS, typeCode: "RELEVE" };
    const out = prochainEtat(r, ACTIONS.VALIDER, owona);
    assert.equal(out.ok, false);
    assert.equal(out.code, 403);
  });

  it("empêche un chef de valider un relevé", () => {
    const r = { demandeurId: "u-amina", etat: ETATS.EN_COURS, typeCode: "RELEVE" };
    const out = prochainEtat(r, ACTIONS.VALIDER, fotso);
    assert.equal(out.ok, false);
    assert.equal(out.code, 403);
  });

  it("laisse le chef viser un recours", () => {
    const r = { demandeurId: "u-jean", etat: ETATS.EN_COURS, typeCode: "RECOURS" };
    const out = prochainEtat(r, ACTIONS.VALIDER, fotso);
    assert.equal(out.ok, true);
    assert.equal(out.etat, ETATS.VALIDEE);
  });
});

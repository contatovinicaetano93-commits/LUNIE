import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

import {
  createSessionToken,
  readSessionToken,
  verifyCredentials,
} from "./session";

describe("admin session", () => {
  before(() => {
    process.env.ADMIN_EMAIL = "contato.vinicaetano93@gmail.com";
    process.env.ADMIN_PASSWORD = "12345678";
    process.env.ADMIN_SESSION_SECRET = "test-secret";
  });

  it("aceita as credenciais configuradas", () => {
    assert.equal(
      verifyCredentials("contato.vinicaetano93@gmail.com", "12345678"),
      true,
    );
    assert.equal(
      verifyCredentials("contato.vinicaetano93@gmail.com", "errada"),
      false,
    );
  });

  it("cria e valida um token assinado", async () => {
    const token = await createSessionToken("contato.vinicaetano93@gmail.com");
    const session = await readSessionToken(token);
    assert.ok(session);
    assert.equal(session.email, "contato.vinicaetano93@gmail.com");
  });

  it("rejeita token adulterado", async () => {
    const token = await createSessionToken("contato.vinicaetano93@gmail.com");
    const [body] = token.split(".");
    const session = await readSessionToken(`${body}.assinatura-falsa`);
    assert.equal(session, null);
  });
});

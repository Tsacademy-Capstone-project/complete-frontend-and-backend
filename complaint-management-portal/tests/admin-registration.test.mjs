import assert from "node:assert/strict";
import { test } from "node:test";
import api from "../src/services/api.js";

const fields = {
  firstName: " Alex ",
  lastName: " Morgan ",
  userName: " alexm ",
  email: " alex@example.com ",
  password: "securePass123",
  signupCode: " invitation-code ",
};

function mockStorage(t, storage) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  const previousLocal = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: storage });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { removeItem() {} } });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "sessionStorage", previous);
    else delete globalThis.sessionStorage;
    if (previousLocal) Object.defineProperty(globalThis, "localStorage", previousLocal);
    else delete globalThis.localStorage;
  });
}

test("admin registration sends the account fields and saves the returned session", async (t) => {
  const user = { _id: "admin-id", firstName: "Alex", lastName: "Morgan", role: "ADMIN" };
  const tokens = new Map();
  mockStorage(t, {
    getItem: (key) => tokens.get(key) ?? null,
    setItem: (key, value) => tokens.set(key, value),
  });
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "http://localhost:8000/api/auth/register-admin");
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body), {
      firstName: "Alex", lastName: "Morgan", userName: "alexm",
      email: "alex@example.com", password: fields.password, signupCode: "invitation-code",
    });
    return { ok: true, text: async () => JSON.stringify({ token: "admin-token", user }) };
  });
  assert.deepEqual(await api.registerAdmin(fields), user);
  assert.equal(tokens.get("complaintshq_token"), "admin-token");
});

test("a rejected admin signup exposes the API message and preserves the existing session", async (t) => {
  mockStorage(t, {
    getItem: () => "existing-token",
    setItem: () => assert.fail("Rejected signup must not store a token"),
  });
  t.mock.method(globalThis, "fetch", async () => ({
    ok: false, status: 403,
    text: async () => JSON.stringify({ message: "A valid admin signup code is required" }),
  }));
  await assert.rejects(api.registerAdmin(fields), /A valid admin signup code is required/);
});

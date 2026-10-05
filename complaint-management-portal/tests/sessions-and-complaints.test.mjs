import assert from "node:assert/strict";
import { test } from "node:test";
import api from "../src/services/api.js";

function storage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
}

function globals(t) {
  for (const name of ["sessionStorage", "localStorage"]) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: storage() });
    t.after(() => { if (previous) Object.defineProperty(globalThis, name, previous); else delete globalThis[name]; });
  }
}

const response = (data) => ({ ok: true, text: async () => JSON.stringify(data) });

test("admin login/logout in another tab preserves the user's token and complaint requests", async (t) => {
  globals(t);
  const userTab = storage();
  const adminTab = storage();
  userTab.setItem("complaintshq_token", "user-token");
  localStorage.setItem("complaintshq_token", "old-shared-admin-token");
  globalThis.sessionStorage = adminTab;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (url.endsWith("/auth/login")) return response({ token: "admin-token", user: { role: "ADMIN" } });
    assert.equal(options.headers.Authorization, "Bearer user-token");
    return response({ complaint: { complaintId: "CMP-2026-00001" } });
  });
  assert.equal((await api.login({ email: "admin@example.com", password: "password" })).role, "ADMIN");
  assert.equal(adminTab.getItem("complaintshq_token"), "admin-token");
  assert.equal(userTab.getItem("complaintshq_token"), "user-token");
  assert.equal(localStorage.getItem("complaintshq_token"), null);
  globalThis.sessionStorage = userTab;
  await api.createComplaint({ title: "Example", description: "Example", category: "SERVICE", priority: "LOW" });
  globalThis.sessionStorage = adminTab;
  api.logout();
  assert.equal(adminTab.getItem("complaintshq_token"), null);
  assert.equal(userTab.getItem("complaintshq_token"), "user-token");
});

test("a legacy shared login is discarded instead of silently switching accounts", (t) => {
  globals(t);
  localStorage.setItem("complaintshq_token", "legacy-admin");
  assert.equal(api.hasSession(), false);
  assert.equal(localStorage.getItem("complaintshq_token"), null);
});

test("admin complaint listing reads every page from the admin API response", async (t) => {
  globals(t);
  sessionStorage.setItem("complaintshq_token", "admin-token");
  let page = 0;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    page += 1;
    assert.equal(options.headers.Authorization, "Bearer admin-token");
    assert.equal(url, `http://localhost:8000/api/admin/complaints?page=${page}&limit=100`);
    return response({ data: [{ complaintId: `CMP-2026-0000${page}`, title: `Complaint ${page}` }], pagination: { hasNextPage: page === 1 } });
  });
  assert.deepEqual((await api.getComplaints()).map((item) => item.complaintId), ["CMP-2026-00001", "CMP-2026-00002"]);
  assert.equal(page, 2);
});

test("invalid admin response reports an error instead of showing an empty complaint list", async (t) => {
  globals(t);
  t.mock.method(globalThis, "fetch", async () => response({ complaints: [] }));
  await assert.rejects(api.getComplaints(), /invalid admin complaints response/);
});

test("admin resolution uses the public complaint ID and sends the native resolution field", async (t) => {
  globals(t);
  sessionStorage.setItem("complaintshq_token", "admin-token");
  const complaint = { complaintId: "CMP-2026-00001", status: "RESOLVED", resolution: "Fixed" };
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "http://localhost:8000/api/admin/complaints/CMP-2026-00001/resolve");
    assert.equal(options.method, "PATCH");
    assert.equal(options.headers.Authorization, "Bearer admin-token");
    assert.deepEqual(JSON.parse(options.body), { resolution: "Fixed" });
    return response({ complaint });
  });
  assert.deepEqual(await api.resolveComplaint("CMP-2026-00001", " Fixed "), complaint);
});

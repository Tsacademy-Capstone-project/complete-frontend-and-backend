const assert = require("node:assert/strict");
const { after, test } = require("node:test");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const Complaint = require("../models/complaint.model.js");
const adminRouter = require("../routes/adminComplaint.route.js");
const userRouter = require("../routes/complaint.route.js");
const oldSecret = process.env.JWT_SECRET;
process.env.JWT_SECRET = "complaint-tests-only";
after(() => { if (oldSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = oldSecret; });

const ids = { admin: "66fd1234567890abcdef1234", alice: "66fd1234567890abcdef1235", bob: "66fd1234567890abcdef1236" };
const users = Object.fromEntries(Object.entries(ids).map(([name, id]) => [id,
  { _id: id, firstName: name, lastName: "Example", role: name === "admin" ? "ADMIN" : "USER", isActive: true }
]));

function prepare(t, status = "PENDING") {
  const records = [
    new Complaint({ complaintId: "CMP-2026-00001", title: "Alice's concern", description: "Service issue", category: "SERVICE", status, submittedBy: ids.alice }),
    new Complaint({ complaintId: "CMP-2026-00002", title: "Bob's concern", description: "Payment issue", category: "PAYMENT", submittedBy: ids.bob }),
  ];
  t.mock.method(User, "findById", async (id) => users[id] || null);
  const matches = (item, filter) => Object.entries(filter).every(([key, value]) =>
    value?.$in ? value.$in.includes(item[key]) : String(item[key]) === String(value)
  );
  t.mock.method(Complaint, "find", (filter) => {
    let selected = records.filter((item) => matches(item, filter));
    const chain = {
      populate() { return this; }, sort() { return this; },
      skip(value) { selected = selected.slice(value); return this; },
      limit(value) { selected = selected.slice(0, value); return this; },
      lean: async () => selected.map((item) => item.toObject()),
      then(resolve, reject) { return Promise.resolve(selected).then(resolve, reject); },
    };
    return chain;
  });
  t.mock.method(Complaint, "countDocuments", async (filter) => records.filter((item) => matches(item, filter)).length);
  t.mock.method(Complaint, "exists", async (filter) => records.some((item) => matches(item, filter)));
  const updates = t.mock.method(Complaint, "findOneAndUpdate", (filter, update) => {
    const item = records.find((record) => matches(record, filter));
    if (item) { Object.assign(item, update.$set); item.statusHistory.push(update.$push.statusHistory); }
    const chain = { populate() { return this; }, then(resolve, reject) { return Promise.resolve(item || null).then(resolve, reject); } };
    return chain;
  });
  return { records, updates };
}

function request(router, account, method, url, body = {}) {
  return new Promise((resolve) => {
    let status;
    const headers = account ? { authorization: `Bearer ${jwt.sign({ userId: ids[account] }, process.env.JWT_SECRET)}` } : {};
    const res = { status(code) { status = code; return this; }, json(data) { resolve({ status, data }); return this; } };
    router.handle({ method, url, headers, body, query: {} }, res, (error) => resolve({ error }));
  });
}

test("admin sees complaints from every user; a user sees only their own", async (t) => {
  prepare(t);
  const admin = await request(adminRouter, "admin", "GET", "/complaints");
  assert.equal(admin.status, 200);
  assert.equal(admin.data.data.length, 2);
  const alice = await request(userRouter, "alice", "GET", "/my");
  assert.equal(alice.status, 200);
  assert.deepEqual(alice.data.complaints.map((item) => item.complaintId), ["CMP-2026-00001"]);
  assert.equal(users[ids.alice].role, "USER");
});

for (const status of ["PENDING", "ASSIGNED", "IN_PROGRESS"]) {
  test(`admin resolves a ${status} complaint and records their response and identity`, async (t) => {
    const { records, updates } = prepare(t, status);
    const result = await request(adminRouter, "admin", "PATCH", "/complaints/CMP-2026-00001/resolve", { resolution: " Issue fixed " });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 200);
    assert.equal(result.data.complaint.status, "RESOLVED");
    assert.equal(records[0].resolution, "Issue fixed");
    assert.ok(records[0].resolvedAt instanceof Date);
    assert.equal(String(records[0].statusHistory[0].changedBy), ids.admin);
    assert.equal(records[0].statusHistory[0].note, "Issue fixed");
    assert.equal(records[0].validateSync(), undefined);
    assert.equal(updates.mock.callCount(), 1);
    const alice = await request(userRouter, "alice", "GET", "/my");
    assert.equal(alice.data.complaints[0].resolution, "Issue fixed");
    assert.equal(users[ids.alice].role, "USER");
  });
}

for (const status of ["RESOLVED", "CLOSED", "REJECTED"]) {
  test(`admin cannot overwrite a ${status} complaint`, async (t) => {
    const { records } = prepare(t, status);
    const { error } = await request(adminRouter, "admin", "PATCH", "/complaints/CMP-2026-00001/resolve", { resolution: "Changed" });
    assert.equal(error.statusCode, 400);
    assert.equal(records[0].status, status);
    assert.equal(records[0].statusHistory.length, 0);
  });
}

for (const account of [null, "alice"]) {
  test(`account ${account} cannot access admin listing or resolution`, async (t) => {
    const { updates } = prepare(t);
    for (const [method, url] of [["GET", "/complaints"], ["PATCH", "/complaints/CMP-2026-00001/resolve"]]) {
      const { error } = await request(adminRouter, account, method, url, { resolution: "Changed" });
      assert.equal(error.statusCode, account ? 403 : 401);
    }
    assert.equal(updates.mock.callCount(), 0);
  });
}

for (const resolution of [undefined, " ", 123]) {
  test(`resolution ${JSON.stringify(resolution)} is rejected without a database update`, async (t) => {
    const { updates } = prepare(t);
    const { error } = await request(adminRouter, "admin", "PATCH", "/complaints/CMP-2026-00001/resolve", { resolution });
    assert.equal(error.statusCode, 400);
    assert.equal(updates.mock.callCount(), 0);
  });
}

test("missing complaints return 404", async (t) => {
  prepare(t);
  const { error } = await request(adminRouter, "admin", "PATCH", "/complaints/CMP-2026-99999/resolve", { resolution: "Fixed" });
  assert.equal(error.statusCode, 404);
});

test("admin sessions cannot submit a complaint as a regular user", async (t) => {
  prepare(t);
  const { error } = await request(userRouter, "admin", "POST", "/", { title: "Example" });
  assert.equal(error.statusCode, 403);
});

test("a user submits a complaint, admin sees and resolves it, and the owner keeps their USER role", async (t) => {
  const { records } = prepare(t);
  t.mock.method(Complaint, "findOne", () => ({ sort: async () => records.at(-1) }));
  t.mock.method(Complaint, "create", async (data) => {
    const item = new Complaint(data);
    await item.validate();
    records.push(item);
    return item;
  });
  const submitted = await request(userRouter, "alice", "POST", "/", {
    title: "New payment concern", description: "Please investigate", category: "PAYMENT", priority: "HIGH",
  });
  assert.equal(submitted.error, undefined);
  assert.equal(submitted.status, 201);
  const complaintId = submitted.data.complaint.complaintId;
  assert.equal(String(submitted.data.complaint.submittedBy), ids.alice);
  const adminList = await request(adminRouter, "admin", "GET", "/complaints");
  assert.ok(adminList.data.data.some((item) => item.complaintId === complaintId));
  const resolved = await request(adminRouter, "admin", "PATCH", `/complaints/${complaintId}/resolve`, { resolution: "Payment corrected" });
  assert.equal(resolved.status, 200);
  const userList = await request(userRouter, "alice", "GET", "/my");
  assert.equal(userList.data.complaints.find((item) => item.complaintId === complaintId).resolution, "Payment corrected");
  assert.equal(users[ids.alice].role, "USER");
});

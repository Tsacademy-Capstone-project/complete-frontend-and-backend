const assert = require("node:assert/strict");
const { after, test } = require("node:test");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const authRouter = require("../routes/auth.route.js");

const envKeys = ["ADMIN_SIGNUP_CODE", "JWT_SECRET", "JWT_EXPIRES_IN"];
const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
after(() => {
  for (const key of envKeys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

function prepare(t) {
  process.env.ADMIN_SIGNUP_CODE = "test-invitation-code";
  process.env.JWT_SECRET = "test-only-jwt-secret";
  process.env.JWT_EXPIRES_IN = "7d";
  const writes = [];
  const lookup = t.mock.method(User, "findOne", async () => null);
  t.mock.method(User, "create", async (data) => {
    const user = new User(data);
    await user.validate();
    writes.push(user);
    return user;
  });
  return { writes, lookup };
}

const validBody = () => ({
  firstName: " Alex ",
  lastName: " Morgan ",
  userName: " AlexM ",
  email: " ALEX@EXAMPLE.COM ",
  password: "securePass123",
  signupCode: "test-invitation-code",
});

function request(body, url = "/register-admin") {
  return new Promise((resolve) => {
    let status;
    const res = {
      status(code) { status = code; return this; },
      json(data) { resolve({ status, data }); return this; },
    };
    authRouter.handle({ method: "POST", url, body }, res, (error) => resolve({ error }));
  });
}

test("admin signup creates an ADMIN, hashes its password, and returns a usable token", async (t) => {
  const { writes } = prepare(t);
  const result = await request({ ...validBody(), role: "USER", signupCode: " test-invitation-code " });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 201);
  assert.equal(result.data.user.role, "ADMIN");
  assert.equal(result.data.user.firstName, "Alex");
  assert.equal(result.data.user.lastName, "Morgan");
  assert.equal(result.data.user.userName, "alexm");
  assert.equal(result.data.user.email, "alex@example.com");
  assert.equal(result.data.user.password, undefined);
  assert.equal(result.data.user.signupCode, undefined);
  assert.equal(writes.length, 1);
  assert.ok(await bcrypt.compare(validBody().password, writes[0].password));
  const payload = jwt.verify(result.data.token, process.env.JWT_SECRET);
  assert.equal(payload.userId, String(writes[0]._id));
});

for (const signupCode of [undefined, "", "wrong-code", 123]) {
  test(`admin signup rejects invalid code ${JSON.stringify(signupCode)} before accessing the database`, async (t) => {
    const { writes, lookup } = prepare(t);
    const { error } = await request({ ...validBody(), signupCode });
    assert.equal(error.statusCode, 403);
    assert.equal(writes.length, 0);
    assert.equal(lookup.mock.callCount(), 0);
  });
}

test("admin signup stays disabled without a configured server code", async (t) => {
  const { lookup } = prepare(t);
  delete process.env.ADMIN_SIGNUP_CODE;
  const { error } = await request(validBody());
  assert.equal(error.statusCode, 503);
  assert.equal(lookup.mock.callCount(), 0);
});

for (const changes of [
  { firstName: " " },
  { lastName: undefined },
  { userName: "a" },
  { email: "not-an-email" },
  { password: "seven77" },
  { password: "a".repeat(21) },
]) {
  test(`admin signup validates account fields ${JSON.stringify(changes)}`, async (t) => {
    const { writes } = prepare(t);
    const { error } = await request({ ...validBody(), ...changes });
    assert.equal(error.statusCode, 400);
    assert.equal(writes.length, 0);
  });
}

test("admin signup rejects an existing email or username", async (t) => {
  const { writes } = prepare(t);
  t.mock.method(User, "findOne", async () => ({ _id: "existing-user" }));
  const { error } = await request(validBody());
  assert.equal(error.statusCode, 409);
  assert.equal(writes.length, 0);
});

test("ordinary registration cannot set its role to ADMIN", async (t) => {
  prepare(t);
  delete process.env.ADMIN_SIGNUP_CODE;
  const result = await request({ ...validBody(), role: "ADMIN", password: "six666" }, "/register");
  assert.equal(result.error, undefined);
  assert.equal(result.status, 201);
  assert.equal(result.data.user.role, "USER");
});

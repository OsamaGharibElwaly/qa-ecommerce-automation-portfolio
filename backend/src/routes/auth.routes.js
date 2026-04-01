const express = require("express");
const { readJson, writeJson } = require("../utils/fileDb");
const { createMockToken } = require("../utils/token");
const { isEmailValid, isStrongPassword } = require("../utils/validation");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email and password are required.",
        code: "VALIDATION_MISSING_FIELDS"
      });
    }
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        message: "name, email and password must be strings.",
        code: "VALIDATION_INVALID_TYPES"
      });
    }
    if (!isEmailValid(email)) {
      return res.status(400).json({ message: "Invalid email format.", code: "VALIDATION_INVALID_EMAIL" });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "Weak password. Use at least 8 chars with upper, lower and number.",
        code: "VALIDATION_WEAK_PASSWORD"
      });
    }

    const users = await readJson("users.json", []);
    const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists.", code: "AUTH_DUPLICATE_EMAIL" });
    }

    const newUser = {
      id: users.length ? Math.max(...users.map((user) => user.id)) + 1 : 1,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    };
    users.push(newUser);
    await writeJson("users.json", users);

    const tokenTtl = Number(process.env.TOKEN_TTL_SECONDS || 3600);
    const token = createMockToken(newUser, tokenTtl);
    return res.status(201).json({
      message: "User registered successfully.",
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed.", code: "AUTH_REGISTER_ERROR" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required.",
        code: "VALIDATION_MISSING_FIELDS"
      });
    }
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        message: "email and password must be strings.",
        code: "VALIDATION_INVALID_TYPES"
      });
    }
    if (!isEmailValid(email)) {
      return res.status(400).json({ message: "Invalid email format.", code: "VALIDATION_INVALID_EMAIL" });
    }

    const users = await readJson("users.json", []);
    const user = users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials.", code: "AUTH_INVALID_CREDENTIALS" });
    }

    const tokenTtl = Number(process.env.TOKEN_TTL_SECONDS || 3600);
    const token = createMockToken(user, tokenTtl);
    return res.status(200).json({
      message: "Login successful.",
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed.", code: "AUTH_LOGIN_ERROR" });
  }
});

module.exports = router;

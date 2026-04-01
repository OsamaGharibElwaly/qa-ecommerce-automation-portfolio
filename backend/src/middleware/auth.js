const { decodeMockToken } = require("../utils/token");
const { readJson } = require("../utils/fileDb");

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Missing or invalid authorization header.",
        code: "AUTH_HEADER_INVALID"
      });
    }

    const token = header.slice(7);
    const payload = decodeMockToken(token);
    if (!payload || !payload.userId || !payload.exp) {
      return res.status(401).json({ message: "Invalid token.", code: "TOKEN_INVALID" });
    }

    const now = Math.floor(Date.now() / 1000);
    if (now >= Number(payload.exp)) {
      return res.status(401).json({ message: "Token expired.", code: "TOKEN_EXPIRED" });
    }

    const users = await readJson("users.json", []);
    const user = users.find((item) => item.id === Number(payload.userId));
    if (!user) {
      return res.status(401).json({ message: "User not found for token.", code: "TOKEN_USER_NOT_FOUND" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;

function createMockToken(user, ttlSeconds = 3600) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    userId: user.id,
    email: user.email,
    iat: now,
    exp: now + ttlSeconds
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

function decodeMockToken(token) {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

module.exports = {
  createMockToken,
  decodeMockToken
};

function isEmailValid(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  if (typeof password !== "string") return false;
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  );
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

module.exports = {
  isEmailValid,
  isStrongPassword,
  isPositiveInteger
};

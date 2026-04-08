import bcrypt from "bcryptjs";

export function hash(value: string) {
  return bcrypt.hash(value, 10);
}

export function compare(value: string, passwordHash: string) {
  return bcrypt.compare(value, passwordHash);
}

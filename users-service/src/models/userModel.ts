const pool = require("../config/db");
import type { CreateUserInput, PublicUser, UpdateUserInput, UserRecord } from "../types";

async function getAllUsers(): Promise<PublicUser[]> {
  const result = await pool.query("SELECT id, name, email, role FROM users ORDER BY id ASC");
  return result.rows;
}

async function createUser(data: CreateUserInput): Promise<PublicUser> {
  const result = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
    [data.name, data.email, data.password, data.role]
  );

  return result.rows[0];
}

async function updateUser(id: number, data: UpdateUserInput): Promise<PublicUser | null> {
  const hasPassword = Boolean(data.password);
  const query = hasPassword
    ? "UPDATE users SET name = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING id, name, email, role"
    : "UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, name, email, role";
  const values = hasPassword
    ? [data.name, data.email, data.password, data.role, id]
    : [data.name, data.email, data.role, id];

  const result = await pool.query(query, values);

  return result.rows[0] || null;
}

async function deleteUser(id: number): Promise<PublicUser | null> {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id, name, email, role",
    [id]
  );

  return result.rows[0] || null;
}

async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const result = await pool.query(
    "SELECT id, name, email, password, role FROM users WHERE email = $1 LIMIT 1",
    [email]
  );

  return result.rows[0] || null;
}

async function countUsers(): Promise<number> {
  const result = await pool.query("SELECT COUNT(*)::int AS total FROM users");
  return result.rows[0].total;
}

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  findUserByEmail,
  countUsers
};

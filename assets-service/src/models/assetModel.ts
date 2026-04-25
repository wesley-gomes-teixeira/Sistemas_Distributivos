const pool = require("../config/db");
import type { Asset, AssetPayload } from "../types";

async function getAllAssets(): Promise<Asset[]> {
  const result = await pool.query(
    "SELECT id, name, type, status, \"userId\" FROM assets ORDER BY id ASC"
  );
  return result.rows;
}

async function createAsset(data: AssetPayload): Promise<Asset> {
  const result = await pool.query(
    "INSERT INTO assets (name, type, status, \"userId\") VALUES ($1, $2, $3, $4) RETURNING id, name, type, status, \"userId\"",
    [data.name, data.type, data.status, data.userId]
  );

  return result.rows[0];
}

async function updateAsset(id: number, data: AssetPayload): Promise<Asset | null> {
  const result = await pool.query(
    "UPDATE assets SET name = $1, type = $2, status = $3, \"userId\" = $4 WHERE id = $5 RETURNING id, name, type, status, \"userId\"",
    [data.name, data.type, data.status, data.userId, id]
  );

  return result.rows[0] || null;
}

async function deleteAsset(id: number): Promise<Asset | null> {
  const result = await pool.query(
    "DELETE FROM assets WHERE id = $1 RETURNING id, name, type, status, \"userId\"",
    [id]
  );

  return result.rows[0] || null;
}

async function unassignAssetsFromUser(userId: number): Promise<Asset[]> {
  const result = await pool.query(
    `UPDATE assets
     SET "userId" = NULL, status = $1
     WHERE "userId" = $2
     RETURNING id, name, type, status, "userId"`,
    ["pendente de reassociacao", userId]
  );

  return result.rows;
}

module.exports = {
  getAllAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  unassignAssetsFromUser
};

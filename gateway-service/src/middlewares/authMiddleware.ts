const jwt = require("jsonwebtoken");
import type { RequestLike, ResponseLike, ServiceError, NextFunction } from "../types";

function authenticateToken(
  req: RequestLike,
  res: ResponseLike,
  next: NextFunction
): ResponseLike | void {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      message: "Token de acesso nao informado."
    });
  }

  try {
    const secret = process.env.JWT_SECRET || "assetflow-secret";
    req.user = jwt.verify(token, secret);
    return next();
  } catch (_error) {
    return res.status(401).json({
      message: "Token invalido ou expirado."
    });
  }
}

module.exports = {
  authenticateToken
};

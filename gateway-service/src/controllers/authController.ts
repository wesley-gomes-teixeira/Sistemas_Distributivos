const jwt = require("jsonwebtoken");
import type { AuthenticatedUser, RequestLike, ResponseLike, ServiceError } from "../types";

async function callUsersService(path: string, body: unknown): Promise<AuthenticatedUser> {
  const usersServiceUrl = process.env.USERS_SERVICE_URL || "http://localhost:3001";
  const response = await fetch(`${usersServiceUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Falha na autenticacao.") as ServiceError;
    error.status = response.status;
    throw error;
  }

  return data;
}

function buildToken(user: AuthenticatedUser): string {
  const secret = process.env.JWT_SECRET || "assetflow-secret";

  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn: "8h" }
  );
}

async function register(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const user = await callUsersService("/auth/register", req.body);
    const token = buildToken(user);

    return res.status(201).json({ token, user });
  } catch (error) {
    const serviceError = error as ServiceError;

    return res.status(serviceError.status || 500).json({
      message: serviceError.message
    });
  }
}

async function login(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const user = await callUsersService("/auth/login", req.body);
    const token = buildToken(user);

    return res.status(200).json({ token, user });
  } catch (error) {
    const serviceError = error as ServiceError;

    return res.status(serviceError.status || 500).json({
      message: serviceError.message
    });
  }
}

module.exports = {
  register,
  login
};

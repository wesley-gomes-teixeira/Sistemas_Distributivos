const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const { publishEvent } = require("../config/rabbitmq");
import type {
  CreateUserInput,
  RequestLike,
  ResponseLike,
  UpdateUserInput,
  UserRole
} from "../types";

const allowedRoles: UserRole[] = ["admin", "analyst", "user"];

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erro inesperado.";
}

async function getUsers(_req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const users = await userModel.getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar usuarios.",
      details: getErrorMessage(error)
    });
  }
}

async function createUser(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const { name, email, password, role } = req.body as Partial<CreateUserInput>;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Os campos name, email e password sao obrigatorios."
      });
    }

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "O campo role informado e invalido."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.createUser({
      name,
      email,
      password: hashedPassword,
      role: role || "analyst"
    });

    await publishEvent("user.created", user);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao criar usuario.",
      details: getErrorMessage(error)
    });
  }
}

async function updateUser(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const id = Number(req.params.id);
    const { name, email, password, role } = req.body as Partial<UpdateUserInput>;

    if (!name || !email) {
      return res.status(400).json({
        message: "Os campos name e email sao obrigatorios."
      });
    }

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Os campos name, email e role validos sao obrigatorios."
      });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const updatedUser = await userModel.updateUser(id, {
      name,
      email,
      role,
      password: hashedPassword
    });

    if (!updatedUser) {
      return res.status(404).json({
        message: "Usuario nao encontrado."
      });
    }

    await publishEvent("user.updated", updatedUser);
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar usuario.",
      details: getErrorMessage(error)
    });
  }
}

async function deleteUser(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const id = Number(req.params.id);
    const deletedUser = await userModel.deleteUser(id);

    if (!deletedUser) {
      return res.status(404).json({
        message: "Usuario nao encontrado."
      });
    }

    await publishEvent("user.deleted", deletedUser);

    return res.status(200).json({
      message: "Usuario removido com sucesso.",
      user: deletedUser
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao remover usuario.",
      details: getErrorMessage(error)
    });
  }
}

async function registerUser(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const totalUsers = await userModel.countUsers();
    req.body.role = totalUsers === 0 ? "admin" : "user";
    return createUser(req, res);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao registrar usuario.",
      details: getErrorMessage(error)
    });
  }
}

async function loginUser(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({
        message: "Os campos email e password sao obrigatorios."
      });
    }

    const user = await userModel.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        message: "Credenciais invalidas."
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Credenciais invalidas."
      });
    }

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao realizar login.",
      details: getErrorMessage(error)
    });
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  registerUser,
  loginUser
};

import type { NextFunction, RequestLike, ResponseLike, UserRole } from "../types";

function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: RequestLike, res: ResponseLike, next: NextFunction): ResponseLike | void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Seu perfil nao possui permissao para executar esta acao."
      });
    }

    return next();
  };
}

module.exports = {
  authorizeRoles
};

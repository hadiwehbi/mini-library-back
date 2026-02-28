import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors';

export function requireRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      next(new ForbiddenError('User not authenticated'));
      return;
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
      next(
        new ForbiddenError(
          `Role '${user.role}' does not have permission. Required: ${roles.join(', ')}`,
        ),
      );
      return;
    }

    next();
  };
}

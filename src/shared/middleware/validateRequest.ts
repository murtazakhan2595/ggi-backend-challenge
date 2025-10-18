import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError as ClassValidatorError } from 'class-validator';
import { ValidationError } from '../errors/AppError';

/**
 * Middleware to validate request body against DTO class
 */
export function validateRequest(dtoClass: any) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Transform plain object to class instance
      const dtoInstance = plainToClass(dtoClass, req.body);

      // Validate
      const errors: ClassValidatorError[] = await validate(dtoInstance);

      if (errors.length > 0) {
        // Format error messages
        const errorMessages = errors.map((error) => Object.values(error.constraints || {})).flat();

        throw new ValidationError(`Validation failed: ${errorMessages.join(', ')}`);
      }

      // Attach validated DTO to request
      req.body = dtoInstance;
      next();
    } catch (error) {
      next(error);
    }
  };
}

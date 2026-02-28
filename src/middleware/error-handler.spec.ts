import { Request, Response } from 'express';
import { ZodError, ZodIssueCode } from 'zod';
import { errorHandler } from './error-handler';
import { NotFoundError, ValidationError } from '../errors';

function createMockReqRes() {
  const req = { headers: { 'x-request-id': 'test-req-id' } } as unknown as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const next = jest.fn();
  return { req, res, next };
}

describe('errorHandler', () => {
  it('should handle AppError', () => {
    const { req, res, next } = createMockReqRes();
    const err = new NotFoundError('Book not found');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'NOT_FOUND',
          message: 'Book not found',
        }),
      }),
    );
  });

  it('should handle ZodError', () => {
    const { req, res, next } = createMockReqRes();
    const err = new ZodError([
      {
        code: ZodIssueCode.invalid_type,
        expected: 'string',
        received: 'undefined',
        path: ['title'],
        message: 'Required',
      },
    ]);

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
        }),
      }),
    );
  });

  it('should handle unknown errors', () => {
    const { req, res, next } = createMockReqRes();
    const err = new Error('Something unexpected');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'INTERNAL_ERROR',
        }),
      }),
    );
  });
});

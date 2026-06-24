import { ZodError } from "zod";

import type { ActionResult } from "@/lib/types";

export function fromValidationError(error: ZodError): ActionResult {
  return {
    ok: false,
    message: "Please fix the highlighted fields.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

export function successResult<T>(message: string, data?: T): ActionResult<T> {
  return {
    ok: true,
    message,
    data,
  };
}

export function failureResult(message: string): ActionResult {
  return {
    ok: false,
    message,
  };
}

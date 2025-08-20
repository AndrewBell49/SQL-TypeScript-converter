import { z } from 'zod';

export const varTypeTypes = ['string', 'number', 'boolean', 'bigint']

export interface variablesInterface {
  name: string,
  type: typeof varTypeTypes[number],
  error: boolean,
}

export const variableNameSchema = z
  .string()
  .min(1, 'Name is required')
  .regex(/^[A-Za-z0-9_]*$/, 'Invalid Characters')
  .regex(/^[A-Za-z_][A-Za-z0-9]*/, 'Must not start with a number')
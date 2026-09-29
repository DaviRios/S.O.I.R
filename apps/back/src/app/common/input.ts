import { BadRequestException } from '@nestjs/common';

export type InputRecord = Record<string, unknown>;

export function asRecord(value: unknown): InputRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('O corpo da requisição deve ser um objeto');
  }
  return value as InputRecord;
}

export function requiredString(
  input: InputRecord,
  key: string,
  label = key,
): string {
  const value = input[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new BadRequestException(`${label} é obrigatório`);
  }
  return value.trim();
}

export function optionalString(
  input: InputRecord,
  key: string,
  fallback = '',
): string {
  const value = input[key];
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'string') {
    throw new BadRequestException(`${key} deve ser um texto`);
  }
  return value.trim();
}

export function optionalBoolean(
  input: InputRecord,
  key: string,
  fallback: boolean,
): boolean {
  const value = input[key];
  if (value === undefined) return fallback;
  if (typeof value !== 'boolean') {
    throw new BadRequestException(`${key} deve ser verdadeiro ou falso`);
  }
  return value;
}

export function optionalNumber(
  input: InputRecord,
  key: string,
  fallback: number,
): number {
  const value = input[key];
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new BadRequestException(`${key} deve ser um número`);
  }
  return value;
}

export function enumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  label: string,
  fallback?: T,
): T {
  if (value === undefined && fallback !== undefined) return fallback;
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new BadRequestException(`${label} inválido`);
  }
  return value as T;
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

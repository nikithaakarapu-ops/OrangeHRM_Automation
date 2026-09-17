import { expect } from '@playwright/test';

export function verifyEqual(actual: unknown, expected: unknown, message: string) {
  expect.soft(actual, message).toEqual(expected);
}

export function verifyStatus(actualStatus: number, expectedStatus: number, message: string) {
  expect.soft(actualStatus, message).toBe(expectedStatus);
}

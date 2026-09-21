import path from 'path';

export const STORAGE_STATE_PATH = path.join(__dirname, '../playwright/.auth/user.json');
export const ESS_STORAGE_STATE_PATH = path.join(__dirname, '../playwright/.auth/ess.json');
export const ESS_USER_PATH = path.join(__dirname, '../playwright/.auth/ess-user.json');

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

export const TAGS = {
  SMOKE: '@smoke',
  REGRESSION: '@regression',
  RBAC: '@rbac',
};

export const USER_ROLES = {
  ADMIN: 1,
  ESS: 2
};

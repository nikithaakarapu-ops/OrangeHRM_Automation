import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const testEnv = (process.env.TEST_ENV ?? "qa").trim();
const envFile = path.resolve(process.cwd(), `.env.${testEnv}`);

dotenv.config({ path: fs.existsSync(envFile) ? envFile : ".env", quiet: true });

export const config = {
  env: testEnv,
  isProd: testEnv === "prod",
  baseUrl: process.env.BASE_URL!,
  username: process.env.ORANGEHRM_USERNAME!,
  password: process.env.ORANGEHRM_PASSWORD!,
  apiBaseUri: process.env.API_BASE_URI!
};

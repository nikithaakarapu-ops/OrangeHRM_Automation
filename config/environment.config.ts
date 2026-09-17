import dotenv from "dotenv";

dotenv.config();

export const config = {
  baseUrl: process.env.BASE_URL!,
  username: process.env.ORANGEHRM_USERNAME!,
  password: process.env.ORANGEHRM_PASSWORD!,
  apiBaseUri: process.env.API_BASE_URI!
};

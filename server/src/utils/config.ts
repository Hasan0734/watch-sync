import { loadEnvFile } from "node:process";

try {
  loadEnvFile();
} catch (e) {
  console.log(e);
}


export default {
  ...process.env
};

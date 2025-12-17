import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend server running on http://localhost:${PORT}`);
});
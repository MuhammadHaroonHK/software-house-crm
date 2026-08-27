import "dotenv/config";

import env from "./config/env";
import app from "./app";

const PORT = Number(env.PORT);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
import { initDb } from "./src/db/index";
import { deleteExpiredSessions } from "./src/db/session";
import { boardRoutes } from "./src/routes/boards";
import { columnRoutes } from "./src/routes/columns";
import { cardRoutes } from "./src/routes/cards";
import { authRoutes } from "./src/routes/auth";
import { labelRoutes } from "./src/routes/labels";
import index from "./index.html";

initDb();
deleteExpiredSessions();

Bun.serve({
  routes: {
    "/": index,
    ...authRoutes,
    ...boardRoutes,
    ...columnRoutes,
    ...cardRoutes,
    ...labelRoutes,
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log("Server running at http://localhost:3000");

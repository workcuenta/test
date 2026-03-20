import {
  createBoard,
  getBoardById,
  listBoards,
  updateBoard,
  deleteBoard,
  getBoardMetrics,
} from "../db/board";
import { requireAuth } from "../auth";

type Req = Request & { params: Record<string, string> };

const json = (data: unknown, status = 200) => Response.json(data, { status });

export const boardRoutes = {
  "/api/boards": {
    GET: async (req: Request) => {
      try {
        const { userId } = await requireAuth(req);
        return json(listBoards(userId));
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: "Internal error" }, 500);
      }
    },
    POST: async (req: Request) => {
      try {
        const { userId } = await requireAuth(req);
        const body = (await req.json()) as { name?: string };
        return json(createBoard(userId, body.name ?? ""), 201);
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: (e as any).message }, 400);
      }
    },
  },
  "/api/boards/:id/metrics": {
    GET: async (req: Req) => {
      try {
        const { userId } = await requireAuth(req);
        const metrics = getBoardMetrics(Number(req.params.id), userId);
        return metrics ? json(metrics) : json({ error: "Not found" }, 404);
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: "Internal error" }, 500);
      }
    },
  },
  "/api/boards/:id": {
    GET: async (req: Req) => {
      try {
        const { userId } = await requireAuth(req);
        const board = getBoardById(Number(req.params.id), userId);
        return board ? json(board) : json({ error: "Not found" }, 404);
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: "Internal error" }, 500);
      }
    },
    PATCH: async (req: Req) => {
      try {
        const { userId } = await requireAuth(req);
        const body = (await req.json()) as { name?: string };
        return json(updateBoard(Number(req.params.id), body.name ?? "", userId));
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: (e as any).message }, 400);
      }
    },
    DELETE: async (req: Req) => {
      try {
        const { userId } = await requireAuth(req);
        deleteBoard(Number(req.params.id), userId);
        return new Response(null, { status: 204 });
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: "Internal error" }, 500);
      }
    },
  },
};

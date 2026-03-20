import {
  createColumn,
  getColumnById,
  listColumns,
  updateColumn,
  reorderColumn,
  deleteColumn,
} from "../db/column";
import { requireAuth } from "../auth";

type Req = Request & { params: Record<string, string> };

const json = (data: unknown, status = 200) => Response.json(data, { status });

export const columnRoutes = {
  "/api/boards/:boardId/columns": {
    GET: async (req: Req) => {
      try {
        await requireAuth(req);
        return json(listColumns(Number(req.params.boardId)));
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: "Internal error" }, 500);
      }
    },
    POST: async (req: Req) => {
      try {
        await requireAuth(req);
        const body = (await req.json()) as { name?: string };
        return json(
          createColumn(Number(req.params.boardId), body.name ?? ""),
          201
        );
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: (e as any).message }, 400);
      }
    },
  },
  "/api/columns/:id": {
    PATCH: async (req: Req) => {
      const id = Number(req.params.id);
      try {
        await requireAuth(req);
        const body = (await req.json()) as {
          name?: string;
          position?: number;
        };
        if (body.name !== undefined) {
          updateColumn(id, body.name);
        }
        if (body.position !== undefined) {
          reorderColumn(id, body.position);
        }
        const col = getColumnById(id);
        return col ? json(col) : json({ error: "Not found" }, 404);
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: (e as any).message }, 400);
      }
    },
    DELETE: async (req: Req) => {
      try {
        await requireAuth(req);
        deleteColumn(Number(req.params.id));
        return new Response(null, { status: 204 });
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: "Internal error" }, 500);
      }
    },
  },
};

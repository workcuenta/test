import {
  createLabel,
  listLabels,
  getLabelById,
  updateLabel,
  deleteLabel,
  attachLabel,
  detachLabel,
  getLabelsForCard,
} from "../db/label";
import { requireAuth } from "../auth";

type Req = Request & { params: Record<string, string> };

const json = (data: unknown, status = 200) => Response.json(data, { status });

export const labelRoutes = {
  "/api/boards/:boardId/labels": {
    GET: async (req: Req) => {
      try {
        await requireAuth(req);
        return json(listLabels(Number(req.params.boardId)));
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: "Internal error" }, 500);
      }
    },
    POST: async (req: Req) => {
      try {
        await requireAuth(req);
        const body = (await req.json()) as { name?: string; color?: string };
        return json(
          createLabel(
            Number(req.params.boardId),
            body.name ?? "",
            body.color ?? ""
          ),
          201
        );
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: (e as any).message }, 400);
      }
    },
  },

  "/api/labels/:id": {
    PATCH: async (req: Req) => {
      try {
        await requireAuth(req);
        const body = (await req.json()) as { name?: string; color?: string };
        return json(updateLabel(Number(req.params.id), body));
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: (e as any).message }, 400);
      }
    },
    DELETE: async (req: Req) => {
      try {
        await requireAuth(req);
        deleteLabel(Number(req.params.id));
        return new Response(null, { status: 204 });
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: "Internal error" }, 500);
      }
    },
  },

  "/api/cards/:id/labels": {
    GET: async (req: Req) => {
      try {
        await requireAuth(req);
        return json(getLabelsForCard(Number(req.params.id)));
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: "Internal error" }, 500);
      }
    },
  },

  "/api/cards/:cardId/labels/:labelId": {
    POST: async (req: Req) => {
      try {
        await requireAuth(req);
        attachLabel(Number(req.params.cardId), Number(req.params.labelId));
        return new Response(null, { status: 204 });
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: "Internal error" }, 500);
      }
    },
    DELETE: async (req: Req) => {
      try {
        await requireAuth(req);
        detachLabel(Number(req.params.cardId), Number(req.params.labelId));
        return new Response(null, { status: 204 });
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: "Internal error" }, 500);
      }
    },
  },
};

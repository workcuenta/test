import {
  createCard,
  getCardById,
  listCards,
  updateCard,
  reorderCard,
  moveCard,
  deleteCard,
} from "../db/card";
import { listCardsWithLabels, getLabelsForCard } from "../db/label";
import { requireAuth } from "../auth";

type Req = Request & { params: Record<string, string> };

const json = (data: unknown, status = 200) => Response.json(data, { status });

export const cardRoutes = {
  "/api/columns/:columnId/cards": {
    GET: async (req: Req) => {
      try {
        await requireAuth(req);
        return json(listCardsWithLabels(Number(req.params.columnId)));
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: "Internal error" }, 500);
      }
    },
    POST: async (req: Req) => {
      try {
        await requireAuth(req);
        const body = (await req.json()) as {
          title?: string;
          description?: string;
        };
        return json(
          createCard(
            Number(req.params.columnId),
            body.title ?? "",
            body.description
          ),
          201
        );
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: (e as any).message }, 400);
      }
    },
  },
  "/api/cards/:id": {
    PATCH: async (req: Req) => {
      const id = Number(req.params.id);
      try {
        await requireAuth(req);
        const body = (await req.json()) as {
          title?: string;
          description?: string | null;
          position?: number;
        };
        if (body.title !== undefined || body.description !== undefined) {
          updateCard(id, { title: body.title, description: body.description });
        }
        if (body.position !== undefined) {
          reorderCard(id, body.position);
        }
        const card = getCardById(id);
        if (!card) return json({ error: "Not found" }, 404);
        return json({ ...card, labels: getLabelsForCard(id) });
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: (e as any).message }, 400);
      }
    },
    DELETE: async (req: Req) => {
      try {
        await requireAuth(req);
        deleteCard(Number(req.params.id));
        return new Response(null, { status: 204 });
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: "Internal error" }, 500);
      }
    },
  },
  "/api/cards/:id/move": {
    POST: async (req: Req) => {
      const id = Number(req.params.id);
      try {
        await requireAuth(req);
        const body = (await req.json()) as {
          columnId: number;
          position?: number;
        };
        moveCard(id, body.columnId, body.position);
        const card = getCardById(id);
        if (!card) return json({ error: "Not found" }, 404);
        return json({ ...card, labels: getLabelsForCard(id) });
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: (e as any).message }, 400);
      }
    },
  },
};

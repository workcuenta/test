## 1. Schema

- [x] 1.1 Add `labels` table to `src/db/schema.ts`: `id`, `board_id` (FK → boards, CASCADE), `name` (NOT NULL), `color` (NOT NULL), `created_at`
- [x] 1.2 Add `card_labels` junction table to `src/db/schema.ts`: `card_id` (FK → cards, CASCADE), `label_id` (FK → labels, CASCADE), PRIMARY KEY (card_id, label_id)

## 2. Label Data Access

- [x] 2.1 Create `src/db/label.ts` with `createLabel(boardId, name, color): Label` — validates non-empty name and hex color format (`/^#[0-9a-fA-F]{6}$/`)
- [x] 2.2 Add `listLabels(boardId): Label[]` — ordered by `created_at` ascending
- [x] 2.3 Add `getLabelById(id): Label | null`
- [x] 2.4 Add `updateLabel(id, fields: { name?, color? }): Label` — validates inputs, returns updated label
- [x] 2.5 Add `deleteLabel(id): void`

## 3. Card-Label Data Access

- [x] 3.1 Add `attachLabel(cardId, labelId): void` — INSERT OR IGNORE (idempotent)
- [x] 3.2 Add `detachLabel(cardId, labelId): void` — DELETE from `card_labels`
- [x] 3.3 Add `getLabelsForCard(cardId): Label[]` — SELECT labels via join
- [x] 3.4 Add `listCardsWithLabels(columnId): CardWithLabels[]` — fetch all cards for a column and JOIN their labels in one query; returns `Card & { labels: Label[] }`

## 4. Label Routes

- [x] 4.1 Create `src/routes/labels.ts` with `GET /api/boards/:boardId/labels` and `POST /api/boards/:boardId/labels`
- [x] 4.2 Add `PATCH /api/labels/:id` and `DELETE /api/labels/:id` to `src/routes/labels.ts`
- [x] 4.3 Add `GET /api/cards/:id/labels`, `POST /api/cards/:cardId/labels/:labelId`, `DELETE /api/cards/:cardId/labels/:labelId` to `src/routes/labels.ts`

## 5. Update Card Routes

- [x] 5.1 Update `GET /api/columns/:columnId/cards` in `src/routes/cards.ts` to use `listCardsWithLabels` so each card response includes a `labels` array
- [x] 5.2 Update `PATCH /api/cards/:id` and `POST /api/cards/:id/move` responses to include the card's current labels

## 6. Server Wiring

- [x] 6.1 Import and spread `labelRoutes` into the `Bun.serve()` routes in `index.ts`

## 7. Frontend — Card Label Chips

- [x] 7.1 Update `src/types.ts` to add `Label` interface and extend `Card` with `labels: Label[]`
- [x] 7.2 Update `src/components/Card.tsx` to render label chips above the title (colored pill, label name)
- [x] 7.3 Update `index.css` with styles for `.label-chip` (small pill with background color, white text, border-radius)

## 8. Frontend — Filter Bar

- [x] 8.1 Add a `FilterBar` component (inline in `frontend.tsx` or `src/components/FilterBar.tsx`) with a text input (debounced 150 ms) and a list of board label toggles
- [x] 8.2 Update `frontend.tsx` to fetch board labels (`GET /api/boards/:id/labels`) as part of `refresh()` and pass them to `FilterBar`
- [x] 8.3 Hold `filterText: string` and `filterLabelIds: Set<number>` in `App` state; pass them to `Board`
- [x] 8.4 Update `src/components/Board.tsx` to accept filter props; filter each column's card array before passing to `Column` (hide cards not matching text AND all selected labels)
- [x] 8.5 Add filter bar styles to `index.css`: search input, label toggle chips (active/inactive state)

## 9. Smoke Test

- [x] 9.1 Start the server, create a label via `POST /api/boards/1/labels` with a name and color, confirm 201
- [x] 9.2 Attach the label to a card via `POST /api/cards/1/labels/:labelId`, confirm it appears in `GET /api/columns/1/cards`
- [x] 9.3 Open the browser, confirm label chips appear on cards
- [x] 9.4 Type in the filter bar, confirm non-matching cards hide and matching cards remain
- [x] 9.5 Click a label filter chip, confirm only cards with that label are shown


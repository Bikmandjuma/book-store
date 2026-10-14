# Booksta.store

A frontend-only demo of a premium online bookstore, built to show a bookstore owner how her business could sell books online.
React + Vite + Tailwind CSS + React Router + Lucide icons. **No backend.** Everything is saved in the browser's LocalStorage.

## Run it

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

Other commands:

```bash
npm run build      # production build into dist/
npm run preview    # serve the production build locally
```

Deploying the `dist/` folder: `public/_redirects` (Netlify) and `vercel.json` (Vercel) are included so that
direct links such as `/books/atomic-habits` work after deployment.

## What is inside

| Area | Route |
| --- | --- |
| Homepage (hero carousel, authors, recommended, categories, bestsellers, offers, editor's picks, testimonials, newsletter) | `/` |
| Catalogue with search, category/price/rating/availability filters, sorting and Load More | `/shop` |
| Book details with gallery + enlarged viewer, reviews, related books | `/books/:slug` |
| Cart with promo codes | `/cart` |
| Demo checkout and confirmation | `/checkout`, `/order/:ref` |
| Wishlist | `/wishlist` |
| My Orders (details, cancellation) | `/orders` |
| Store management demo (overview, books, categories, orders, settings) | `/manage` |
| About and store policies | `/about`, `/policies` |

Sample promo codes: `WELCOME10`, `READ15` (orders over 40), `BOOKWORM5` (orders over 25), `FREESHIP`.

## LocalStorage keys

All keys are prefixed `booksta_` and wrapped as `{ v: 1, data, t }` so the schema can be versioned.

`booksta_books`, `booksta_categories`, `booksta_cart`, `booksta_wishlist`, `booksta_orders`,
`booksta_reviews`, `booksta_settings`, `booksta_newsletter`, plus `booksta_checkout` (unsent checkout form draft).

Sample data is written **only when a key has no saved value**, so a user's changes are never overwritten on reload.
Unreadable or invalid JSON is detected, replaced with sample data, and a warning is shown.
If storage is unavailable (for example some private modes) the app keeps working in memory and shows a banner and error alerts instead of claiming changes were saved.

To reset: Store management > Settings > *Reset all demo data* (asks you to type RESET), or clear site data in your browser.

## Configuration

- **Currency, promo codes, delivery rules, order statuses, payment options:** `src/config.js`
  (currency and delivery fee can also be changed in Store management > Settings).
  Prices are stored in USD and converted for display with illustrative rates, not live exchange rates.
- **Sample books, categories, reviews:** `src/data/`
- **Colours and fonts:** `tailwind.config.js`

## Project structure

```
src/
  components/   header, footer, book cards, gallery, modal, hero carousel, shared controls
  pages/        Home, Shop, BookDetails, Cart, Checkout, OrderConfirmation, Wishlist, Orders, About, Policies, Manage
  pages/manage/ Overview, BooksAdmin, BookForm, CategoriesAdmin, OrdersAdmin, SettingsAdmin
  context/      ToastContext, ConfirmContext, StoreContext (all app state + actions)
  services/     storage.js (LocalStorage wrapper), normalize.js (safe loading), orders.js
  data/         sample books, categories, reviews
  utils/        formatting, pricing, validation, search, ids
  hooks/        useDocumentTitle, useReducedMotion
```

## Book covers

Covers load from Open Library by ISBN, so they need an internet connection. If a cover is missing, slow or blocked, a designed
typographic cover is shown instead, so the layout never breaks. Replace any cover in Store management > Books > Edit.

## Honest limits of this demo

- Orders, reviews, ratings, review counts, stock, order statuses, testimonials and prices are **sample content**, labelled as such.
- Checkout never takes payment and never asks for card details.
- Store management has **no login and no real protection**. It only illustrates how an owner could manage the catalogue.
- Customer accounts, secure administration, shared inventory, real payments, email delivery and order fulfilment need a backend.

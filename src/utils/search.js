export function matchesQuery(book, categoryName, query) {
  const tokens = String(query || '').toLowerCase().split(/\s+/).filter(Boolean)
  if (!tokens.length) return true
  const hay = [book.title, book.subtitle, book.author, categoryName, book.keywords, book.summary, book.description, book.isbn, book.publisher]
    .join(' ')
    .toLowerCase()
  return tokens.every((t) => hay.includes(t))
}

export function suggestBooks(books, categories, query, limit = 5) {
  const q = String(query || '').trim().toLowerCase()
  if (q.length < 2) return []
  const catName = (id) => categories.find((c) => c.id === id)?.name || ''
  return books
    .filter((b) => matchesQuery(b, catName(b.category), q))
    .map((b) => {
      const t = b.title.toLowerCase()
      const a = b.author.toLowerCase()
      const score = t.startsWith(q) ? 0 : t.includes(q) ? 1 : a.includes(q) ? 2 : 3
      return { b, score }
    })
    .sort((x, y) => x.score - y.score || y.b.popularity - x.b.popularity)
    .slice(0, limit)
    .map((x) => x.b)
}

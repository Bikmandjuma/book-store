/** Groups books by author. Co-authored books keep their combined credit as one author entry. */
export function groupAuthors(books) {
  const map = new Map()
  for (const b of books) {
    const a = map.get(b.author) || { name: b.author, books: [], popularity: 0 }
    a.books.push(b)
    a.popularity += b.popularity
    map.set(b.author, a)
  }
  return [...map.values()].sort((x, y) => y.popularity - x.popularity)
}

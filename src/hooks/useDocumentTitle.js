import { useEffect } from 'react'

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} - Booksta.store` : 'Booksta.store - Books worth keeping'
  }, [title])
}

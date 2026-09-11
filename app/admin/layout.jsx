// The admin panel has nothing for search engines to index and shouldn't
// appear in results — this noindex applies to every /admin/* route,
// including client-component pages (like /admin/login) that can't export
// their own metadata.
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }) {
  return children
}

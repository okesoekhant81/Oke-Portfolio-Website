import AdminNav from '../../../../components/admin/AdminNav'
import PostForm from '../../../../components/admin/PostForm'

export default function NewPostPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/posts" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">New article</h1>
        <PostForm />
      </div>
    </main>
  )
}

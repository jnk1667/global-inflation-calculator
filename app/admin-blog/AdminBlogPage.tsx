"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Save, Plus, Trash2, RefreshCw, FileText, Edit } from "lucide-react"

interface BlogContent {
  id: string
  content: string
  title: string
  meta_description: string | null
  keywords: string[] | null
  updated_at: string
}

export default function AdminBlogPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const [posts, setPosts] = useState<BlogContent[]>([])
  const [editingPost, setEditingPost] = useState<BlogContent | null>(null)
  const [newPost, setNewPost] = useState<Partial<BlogContent>>({
    id: "",
    title: "",
    content: "",
    meta_description: "",
    keywords: [],
  })

  const [keywordInput, setKeywordInput] = useState("")

  // Authentication
  const handleLogin = () => {
    const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    if (password && envPassword && password === envPassword) {
      setIsAuthenticated(true)
      setError("")
      loadPosts()
    } else {
      setError("Invalid password. Please check your credentials.")
    }
  }

  // Load all blog posts from seo_content table (filter for _essay suffix)
  const loadPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/seo-content")
      const result = await response.json()

      if (result.success && result.data) {
        // Filter for blog/essay content (entries with _essay suffix)
        const blogPosts = result.data.filter((item: BlogContent) => item.id.endsWith("_essay"))
        setPosts(blogPosts)
        setMessage("Blog posts loaded successfully!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        throw new Error(result.error || "Failed to load posts")
      }
    } catch (err) {
      console.error("Error loading posts:", err)
      setError(`Failed to load posts: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  // Create new post
  const createPost = async () => {
    if (!newPost.id || !newPost.title || !newPost.content) {
      setError("ID, title, and content are required")
      return
    }

    // Ensure ID ends with _essay
    const postId = newPost.id.endsWith("_essay") ? newPost.id : `${newPost.id}_essay`

    setSaving(true)
    try {
      const response = await fetch("/api/seo-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: postId,
          title: newPost.title,
          content: newPost.content,
          meta_description: newPost.meta_description || "",
          keywords: newPost.keywords || [],
        }),
      })

      const result = await response.json()
      if (!result.success) throw new Error(result.error)

      setPosts((prev) => [result.data, ...prev])
      setNewPost({
        id: "",
        title: "",
        content: "",
        meta_description: "",
        keywords: [],
      })
      setMessage("Blog post created successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      console.error("Error creating post:", err)
      setError(`Failed to create post: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setSaving(false)
    }
  }

  // Update existing post
  const updatePost = async (post: BlogContent) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/seo-content/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          meta_description: post.meta_description,
          keywords: post.keywords,
        }),
      })

      const result = await response.json()
      if (!result.success) throw new Error(result.error)

      setPosts((prev) => prev.map((p) => (p.id === post.id ? result.data : p)))
      setEditingPost(null)
      setMessage("Blog post updated successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      console.error("Error updating post:", err)
      setError(`Failed to update post: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setSaving(false)
    }
  }

  // Delete post
  const deletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const response = await fetch(`/api/seo-content/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()
      if (!result.success) throw new Error(result.error)

      setPosts((prev) => prev.filter((p) => p.id !== id))
      setMessage("Blog post deleted successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      console.error("Error deleting post:", err)
      setError(`Failed to delete post: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  // Add keyword
  const addKeyword = (isNew: boolean) => {
    if (!keywordInput.trim()) return

    if (isNew) {
      setNewPost((prev) => ({
        ...prev,
        keywords: [...(prev.keywords || []), keywordInput.trim()],
      }))
    } else if (editingPost) {
      setEditingPost({
        ...editingPost,
        keywords: [...(editingPost.keywords || []), keywordInput.trim()],
      })
    }
    setKeywordInput("")
  }

  // Remove keyword
  const removeKeyword = (index: number, isNew: boolean) => {
    if (isNew) {
      setNewPost((prev) => ({
        ...prev,
        keywords: prev.keywords?.filter((_, i) => i !== index) || [],
      }))
    } else if (editingPost) {
      setEditingPost({
        ...editingPost,
        keywords: (editingPost.keywords || []).filter((_, i) => i !== index),
      })
    }
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Blog Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main admin interface
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Blog Management Dashboard
                </CardTitle>
                <p className="text-gray-600">Manage blog posts and content</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadPosts} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        {message && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="posts">All Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="new">Create New Post</TabsTrigger>
          </TabsList>

          {/* All Posts */}
          <TabsContent value="posts" className="space-y-4">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No blog posts yet. Create your first post!</p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {post.title}
                          <Badge variant="secondary">{post.id}</Badge>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span>Updated: {new Date(post.updated_at).toLocaleDateString()}</span>
                            <span>Words: {post.content.split(/\s+/).filter(Boolean).length}</span>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingPost(post)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deletePost(post.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {editingPost?.id === post.id && (
                    <CardContent className="space-y-4 border-t pt-6">
                      <div className="space-y-2">
                        <Label>ID (cannot be changed)</Label>
                        <Input value={editingPost.id} disabled />
                      </div>

                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={editingPost.title}
                          onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Content</Label>
                        <Textarea
                          value={editingPost.content}
                          onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                          rows={20}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500">
                          Word count: {editingPost.content.split(/\s+/).filter(Boolean).length}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Meta Description</Label>
                        <Textarea
                          value={editingPost.meta_description || ""}
                          onChange={(e) => setEditingPost({ ...editingPost, meta_description: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Keywords</Label>
                        <div className="flex gap-2">
                          <Input
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword(false))}
                            placeholder="Add keyword..."
                          />
                          <Button type="button" onClick={() => addKeyword(false)}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(editingPost.keywords || []).map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {keyword}
                              <button onClick={() => removeKeyword(index, false)} className="ml-1">
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => updatePost(editingPost)} disabled={saving}>
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button variant="outline" onClick={() => setEditingPost(null)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          {/* Create New Post */}
          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle>Create New Blog Post</CardTitle>
                <CardDescription>
                  Fill in the details to create a new blog post in the seo_content table
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>ID * (will automatically add _essay suffix)</Label>
                  <Input
                    value={newPost.id}
                    onChange={(e) => setNewPost({ ...newPost, id: e.target.value })}
                    placeholder="charts (will become charts_essay)"
                  />
                  <p className="text-xs text-gray-500">
                    Use a short identifier like "charts", "inflation", "retirement", etc.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Enter post title..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content *</Label>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={20}
                    className="font-mono text-sm"
                    placeholder="Write your blog post content here..."
                  />
                  <p className="text-xs text-gray-500">
                    Word count: {(newPost.content || "").split(/\s+/).filter(Boolean).length}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    value={newPost.meta_description}
                    onChange={(e) => setNewPost({ ...newPost, meta_description: e.target.value })}
                    rows={2}
                    placeholder="SEO meta description..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword(true))}
                      placeholder="Add keyword..."
                    />
                    <Button type="button" onClick={() => addKeyword(true)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(newPost.keywords || []).map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {keyword}
                        <button onClick={() => removeKeyword(index, true)} className="ml-1">
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={createPost}
                  disabled={saving || !newPost.id || !newPost.title || !newPost.content}
                  size="lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {saving ? "Creating..." : "Create Blog Post"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

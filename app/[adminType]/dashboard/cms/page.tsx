"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Globe, FileText, Image, Home, Search, Plus, X } from "lucide-react"
import { TokenManager } from "@/lib/tokenManager"
import { getBackendApiUrl } from "@/lib/config"

interface SEOSettings {
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  og_image?: string
}

interface TestimonialItem {
  name: string
  role: string
  quote?: string
  image?: string
}

interface HomepageSection {
  hero_title?: string
  hero_subtitle?: string
  hero_description?: string
  hero_image?: string
  hero_video?: string
  about_title?: string
  about_subtitle?: string
  courses_title?: string
  courses_subtitle?: string
  testimonials_title?: string
  testimonials_subtitle?: string
  testimonials?: TestimonialItem[]
  cta_title?: string
  cta_subtitle?: string
  registration_media_url?: string
  registration_media_type?: string
}

interface FooterContent {
  footer_text?: string
  copyright_text?: string
  address?: string
  phone?: string
  email?: string
  social_facebook?: string
  social_instagram?: string
  social_twitter?: string
  social_youtube?: string
}

interface BrandingSettings {
  navbar_logo?: string
  footer_logo?: string
  favicon?: string
}

const SEO_PAGES = [
  { key: "home", label: "Home Page" },
  { key: "about", label: "About Page" },
  { key: "courses", label: "Courses Page" },
  { key: "contact", label: "Contact Page" },
  { key: "gallery", label: "Gallery Page" },
  { key: "blog", label: "Blog Page" },
]

export default function CMSPage() {
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("homepage")

  const [homepage, setHomepage] = useState<HomepageSection>({})
  const [footer, setFooter] = useState<FooterContent>({})
  const [branding, setBranding] = useState<BrandingSettings>({})
  const [pageSeo, setPageSeo] = useState<Record<string, SEOSettings>>({})

  useEffect(() => {
    fetchCMSContent()
  }, [])

  const fetchCMSContent = async () => {
    try {
      setLoading(true)
      const token = TokenManager.getToken()
      const res = await fetch(getBackendApiUrl("cms"), {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      if (!res.ok) throw new Error("Failed to fetch CMS content")
      const data = await res.json()
      setHomepage(data.homepage || {})
      setFooter(data.footer || {})
      setBranding(data.branding || {})
      setPageSeo(data.page_seo || {})
    } catch (error) {
      console.error("Error fetching CMS content:", error)
      toast({ title: "Error", description: "Failed to load CMS content", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = TokenManager.getToken()
      const res = await fetch(getBackendApiUrl("cms"), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ homepage, footer, branding, page_seo: pageSeo }),
      })
      if (!res.ok) throw new Error("Failed to save CMS content")
      const data = await res.json()
      setHomepage(data.homepage || {})
      setFooter(data.footer || {})
      setBranding(data.branding || {})
      setPageSeo(data.page_seo || {})
      toast({ title: "Success", description: "CMS content saved successfully" })
    } catch (error) {
      console.error("Error saving CMS content:", error)
      toast({ title: "Error", description: "Failed to save CMS content", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const updatePageSeo = (pageKey: string, field: keyof SEOSettings, value: string) => {
    setPageSeo((prev) => ({
      ...prev,
      [pageKey]: { ...(prev[pageKey] || {}), [field]: value },
    }))
  }


  const handleHeroMediaUpload = async (field: "hero_image" | "hero_video", file: File) => {
    try {
      const token = TokenManager.getToken()
      const formData = new FormData()
      formData.append("file", file)
      const uploadRes = await fetch(getBackendApiUrl("uploads"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!uploadRes.ok) throw new Error("Upload failed")
      const uploadData = await uploadRes.json()
      const fileUrl = uploadData.file_url || uploadData.url || ""
      setHomepage((prev) => ({ ...prev, [field]: fileUrl }))
      toast({ title: "Uploaded", description: `${field.replace("_", " ")} uploaded successfully` })
    } catch (error) {
      console.error("Upload error:", error)
      toast({ title: "Error", description: "Failed to upload file", variant: "destructive" })
    }
  }

  const handleImageUpload = async (field: "navbar_logo" | "footer_logo" | "favicon", file: File) => {
    try {
      const token = TokenManager.getToken()
      const formData = new FormData()
      formData.append("file", file)
      const uploadRes = await fetch(getBackendApiUrl("uploads"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!uploadRes.ok) throw new Error("Upload failed")
      const uploadData = await uploadRes.json()
      const imageUrl = uploadData.url || uploadData.file_url || uploadData.image_url || ""
      setBranding((prev) => ({ ...prev, [field]: imageUrl }))
      toast({ title: "Uploaded", description: `${field.replace("_", " ")} uploaded successfully` })
    } catch (error) {
      console.error("Upload error:", error)
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" })
    }
  }

  const handleTestimonialImageUpload = async (index: number, file: File) => {
    try {
      const token = TokenManager.getToken()
      const formData = new FormData()
      formData.append("file", file)
      const uploadRes = await fetch(getBackendApiUrl("uploads"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!uploadRes.ok) throw new Error("Upload failed")
      const uploadData = await uploadRes.json()
      const imageUrl = uploadData.url || uploadData.file_url || uploadData.image_url || ""
      const list = [...(homepage.testimonials || [])]
      if (!list[index]) list[index] = { name: "", role: "" }
      list[index] = { ...list[index], image: imageUrl }
      setHomepage((prev) => ({ ...prev, testimonials: list }))
      toast({ title: "Uploaded", description: "Testimonial photo uploaded" })
    } catch (error) {
      console.error("Upload error:", error)
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#4F5077]">CMS Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage homepage sections, footer, branding, and SEO settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-yellow-400 hover:bg-yellow-500 text-white">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          <TabsTrigger value="homepage" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Home className="w-4 h-4" /> Homepage
          </TabsTrigger>
          <TabsTrigger value="footer" className="flex items-center gap-2 data-[state=active]:bg-white">
            <FileText className="w-4 h-4" /> Footer
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Image className="w-4 h-4" /> Branding
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Search className="w-4 h-4" /> Page SEO
          </TabsTrigger>
        </TabsList>

        {/* Homepage Section Titles */}
        <TabsContent value="homepage" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#4F5077]">Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Hero Title</Label>
                  <Input value={homepage.hero_title || ""} onChange={(e) => setHomepage({ ...homepage, hero_title: e.target.value })} placeholder="Enter hero title" />
                </div>
                <div className="space-y-2">
                  <Label>Hero Subtitle</Label>
                  <Input value={homepage.hero_subtitle || ""} onChange={(e) => setHomepage({ ...homepage, hero_subtitle: e.target.value })} placeholder="Enter hero subtitle" />
                </div>
                <div className="space-y-2">
                  <Label>Hero Description</Label>
                  <Textarea value={homepage.hero_description || ""} onChange={(e) => setHomepage({ ...homepage, hero_description: e.target.value })} placeholder="Enter hero description" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Hero Image</Label>
                  <div className="flex items-center gap-4">
                    {homepage.hero_image && (
                      <div className="w-24 h-16 border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                        <img src={homepage.hero_image} alt="Hero" className="max-w-full max-h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <Input value={homepage.hero_image || ""} onChange={(e) => setHomepage({ ...homepage, hero_image: e.target.value })} placeholder="Enter image URL or upload below" />
                      <Input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleHeroMediaUpload("hero_image", file) }} className="text-sm" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Hero Video</Label>
                  <div className="flex items-center gap-4">
                    {homepage.hero_video && (
                      <div className="w-24 h-16 border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                        <video src={homepage.hero_video} className="max-w-full max-h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <Input value={homepage.hero_video || ""} onChange={(e) => setHomepage({ ...homepage, hero_video: e.target.value })} placeholder="Enter video URL or upload below" />
                      <Input type="file" accept="video/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleHeroMediaUpload("hero_video", file) }} className="text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#4F5077]">Registration Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Configure the media shown on the left side of the registration steps. Supports images, GIFs, or hosted videos.
              </p>
              <div className="space-y-2">
                <Label>Media URL</Label>
                <Input
                  value={homepage.registration_media_url || ""}
                  onChange={(e) => setHomepage({ ...homepage, registration_media_url: e.target.value })}
                  placeholder="Enter image / GIF / video URL"
                />
              </div>
              <div className="space-y-2">
                <Label>Media Type</Label>
                <Select
                  value={homepage.registration_media_type || ""}
                  onValueChange={(value) => setHomepage({ ...homepage, registration_media_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-detect from URL" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="image">Image / GIF</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#4F5077]">About Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>About Title</Label>
                  <Input value={homepage.about_title || ""} onChange={(e) => setHomepage({ ...homepage, about_title: e.target.value })} placeholder="Enter about section title" />
                </div>
                <div className="space-y-2">
                  <Label>About Subtitle</Label>
                  <Textarea value={homepage.about_subtitle || ""} onChange={(e) => setHomepage({ ...homepage, about_subtitle: e.target.value })} placeholder="Enter about section subtitle" rows={2} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#4F5077]">Courses Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Courses Title</Label>
                  <Input value={homepage.courses_title || ""} onChange={(e) => setHomepage({ ...homepage, courses_title: e.target.value })} placeholder="Enter courses section title" />
                </div>
                <div className="space-y-2">
                  <Label>Courses Subtitle</Label>
                  <Textarea value={homepage.courses_subtitle || ""} onChange={(e) => setHomepage({ ...homepage, courses_subtitle: e.target.value })} placeholder="Enter courses section subtitle" rows={2} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#4F5077]">Testimonials Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Testimonials Title</Label>
                  <Input value={homepage.testimonials_title || ""} onChange={(e) => setHomepage({ ...homepage, testimonials_title: e.target.value })} placeholder="Enter testimonials section title" />
                </div>
                <div className="space-y-2">
                  <Label>Testimonials Subtitle</Label>
                  <Textarea value={homepage.testimonials_subtitle || ""} onChange={(e) => setHomepage({ ...homepage, testimonials_subtitle: e.target.value })} placeholder="Enter testimonials section subtitle" rows={2} />
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <Label>Testimonial cards (round image on top; first 4 shown on home, all on Testimonials page)</Label>
                {(homepage.testimonials || []).map((t, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3 relative bg-gray-50/50">
                    <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2 text-red-500 hover:bg-red-50" onClick={() => setHomepage({ ...homepage, testimonials: (homepage.testimonials || []).filter((_, idx) => idx !== i) })}>
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input value={t.name} onChange={(e) => { const n = [...(homepage.testimonials || [])]; n[i] = { ...t, name: e.target.value }; setHomepage({ ...homepage, testimonials: n }) }} placeholder="Full name" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Role / Title</Label>
                        <Input value={t.role} onChange={(e) => { const n = [...(homepage.testimonials || [])]; n[i] = { ...t, role: e.target.value }; setHomepage({ ...homepage, testimonials: n }) }} placeholder="e.g. Parent, Student" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Quote (optional)</Label>
                      <Textarea value={t.quote || ""} onChange={(e) => { const n = [...(homepage.testimonials || [])]; n[i] = { ...t, quote: e.target.value }; setHomepage({ ...homepage, testimonials: n }) }} placeholder="Testimonial quote" rows={2} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Round image (shows on top of card)</Label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {t.image && <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border" />}
                        <Input type="file" accept="image/*" className="max-w-xs text-sm" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleTestimonialImageUpload(i, file) }} />
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => setHomepage({ ...homepage, testimonials: [...(homepage.testimonials || []), { name: "", role: "" }] })}>
                  <Plus className="h-4 w-4 mr-2" /> Add testimonial
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#4F5077]">Call to Action Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>CTA Title</Label>
                  <Input value={homepage.cta_title || ""} onChange={(e) => setHomepage({ ...homepage, cta_title: e.target.value })} placeholder="Enter CTA title" />
                </div>
                <div className="space-y-2">
                  <Label>CTA Subtitle</Label>
                  <Textarea value={homepage.cta_subtitle || ""} onChange={(e) => setHomepage({ ...homepage, cta_subtitle: e.target.value })} placeholder="Enter CTA subtitle" rows={2} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Content */}
        <TabsContent value="footer" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#4F5077]">Footer Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Footer Description</Label>
                <Textarea value={footer.footer_text || ""} onChange={(e) => setFooter({ ...footer, footer_text: e.target.value })} placeholder="Enter footer description text" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Copyright Text</Label>
                <Input value={footer.copyright_text || ""} onChange={(e) => setFooter({ ...footer, copyright_text: e.target.value })} placeholder="© 2025 Rock Martial Arts. All rights reserved." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#4F5077]">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea value={footer.address || ""} onChange={(e) => setFooter({ ...footer, address: e.target.value })} placeholder="Enter address" rows={2} />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={footer.phone || ""} onChange={(e) => setFooter({ ...footer, phone: e.target.value })} placeholder="Enter phone number" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={footer.email || ""} onChange={(e) => setFooter({ ...footer, email: e.target.value })} placeholder="Enter email address" type="email" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#4F5077]">Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input value={footer.social_facebook || ""} onChange={(e) => setFooter({ ...footer, social_facebook: e.target.value })} placeholder="https://facebook.com/..." />
                </div>
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input value={footer.social_instagram || ""} onChange={(e) => setFooter({ ...footer, social_instagram: e.target.value })} placeholder="https://instagram.com/..." />
                </div>
                <div className="space-y-2">
                  <Label>Twitter / X URL</Label>
                  <Input value={footer.social_twitter || ""} onChange={(e) => setFooter({ ...footer, social_twitter: e.target.value })} placeholder="https://twitter.com/..." />
                </div>
                <div className="space-y-2">
                  <Label>YouTube URL</Label>
                  <Input value={footer.social_youtube || ""} onChange={(e) => setFooter({ ...footer, social_youtube: e.target.value })} placeholder="https://youtube.com/..." />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#4F5077]">Logo & Favicon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(["navbar_logo", "footer_logo", "favicon"] as const).map((field) => (
                <div key={field} className="space-y-3 pb-4 border-b last:border-b-0">
                  <Label className="text-base font-semibold capitalize">{field.replace("_", " ")}</Label>
                  <div className="flex items-center gap-4">
                    {branding[field] && (
                      <div className="w-20 h-20 border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                        <img src={branding[field]} alt={field} className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <Input
                        value={branding[field] || ""}
                        onChange={(e) => setBranding({ ...branding, [field]: e.target.value })}
                        placeholder="Enter image URL or upload below"
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(field, file)
                        }}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page-wise SEO */}
        <TabsContent value="seo" className="space-y-6 mt-6">
          {SEO_PAGES.map((page) => (
            <Card key={page.key}>
              <CardHeader>
                <CardTitle className="text-[#4F5077] flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {page.label} SEO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meta Title</Label>
                    <Input
                      value={pageSeo[page.key]?.meta_title || ""}
                      onChange={(e) => updatePageSeo(page.key, "meta_title", e.target.value)}
                      placeholder={`${page.label} - Meta Title`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Meta Keywords</Label>
                    <Input
                      value={pageSeo[page.key]?.meta_keywords || ""}
                      onChange={(e) => updatePageSeo(page.key, "meta_keywords", e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    value={pageSeo[page.key]?.meta_description || ""}
                    onChange={(e) => updatePageSeo(page.key, "meta_description", e.target.value)}
                    placeholder={`${page.label} - Meta Description`}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>OG Image URL</Label>
                  <Input
                    value={pageSeo[page.key]?.og_image || ""}
                    onChange={(e) => updatePageSeo(page.key, "og_image", e.target.value)}
                    placeholder="https://example.com/og-image.jpg"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

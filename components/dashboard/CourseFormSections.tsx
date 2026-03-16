"use client"

import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Upload,
  Plus,
  X,
  Loader2,
  Image as ImageIcon,
  FileText,
  Video,
  Users,
  Star,
  BookOpen,
  Layout,
  Info,
  GraduationCap,
  Paperclip,
} from "lucide-react"
import { uploadFile } from "@/lib/upload"
import { useToast } from "@/hooks/use-toast"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** One block in the About section: custom title, description, optional bullet points, optional image */
export interface AboutContentBlock {
  title?: string
  description?: string
  bullet_points?: string[]
  image?: string
}

export interface PageContent {
  hero_section?: {
    title?: string
    subtitle?: string
    description?: string
    /** Bullet points shown under hero description (e.g. key highlights) */
    bullet_points?: string[]
    hero_image?: string
    cta_text?: string
    cta_link?: string
  }
  course_info?: {
    location?: string
    duration?: string
    price?: string
    training_time?: string
  }
  about_section?: {
    title?: string
    description?: string
    secondary_description?: string
    image1?: string
    image2?: string
    content_blocks?: AboutContentBlock[]
  }
  /** Dynamic sections: 60% text + 40% image or 40% image + 60% text, alternating */
  course_info_sections?: {
    layout: "text_left" | "image_left"
    title?: string
    content?: string
    bullet_points?: string[]
    image?: string
  }[]
  benefits?: { title: string; description: string; icon?: string }[]
  learning_section?: {
    title?: string
    description?: string
    video_url?: string
    thumbnail?: string
  }
  gallery_images?: string[]
  instructors?: {
    name: string
    designation: string
    bio?: string
    photo?: string
  }[]
  testimonials?: {
    name: string
    designation: string
    text: string
    photo?: string
  }[]
  pdf_attachments?: { title: string; file_url: string }[]
}

interface Props {
  value: PageContent
  onChange: (v: PageContent) => void
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function FileUpload({
  accept,
  label,
  currentUrl,
  onUploaded,
}: {
  accept: string
  label: string
  currentUrl?: string
  onUploaded: (url: string) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadFile(file)
      onUploaded(result.file_url)
      toast({ title: "Uploaded", description: file.name })
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" })
    } finally {
      setUploading(false)
      if (ref.current) ref.current.value = ""
    }
  }

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          value={currentUrl || ""}
          onChange={(e) => onUploaded(e.target.value)}
          placeholder="URL or upload a file"
          className="flex-1"
        />
        <input ref={ref} type="file" accept={accept} className="hidden" onChange={handle} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => ref.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </Button>
      </div>
      {currentUrl && accept.startsWith("image") && (
        <img src={currentUrl} alt="" className="mt-1 h-20 rounded object-cover" />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

export default function CourseFormSections({ value, onChange }: Props) {
  const pc = value || {}

  const set = <K extends keyof PageContent>(key: K, val: PageContent[K]) =>
    onChange({ ...pc, [key]: val })

  const hero = pc.hero_section || {}
  const info = pc.course_info || {}
  const about = pc.about_section || {}
  const courseInfoSections = pc.course_info_sections || []
  const benefits = pc.benefits || []
  const learning = pc.learning_section || {}
  const gallery = pc.gallery_images || []
  const instructors = pc.instructors || []
  const testimonials = pc.testimonials || []
  const attachments = pc.pdf_attachments || []

  return (
    <Accordion type="multiple" className="w-full space-y-2" defaultValue={["hero"]}>
      {/* ---- 1. Hero Section ---- */}
      <AccordionItem value="hero" className="border rounded-lg px-4">
        <AccordionTrigger className="text-[#4F5077] font-semibold">
          <span className="flex items-center gap-2"><Layout className="h-4 w-4" /> Hero</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Hero Title</Label>
              <Input value={hero.title || ""} onChange={(e) => set("hero_section", { ...hero, title: e.target.value })} placeholder="e.g. Shaolin Kung Fu" />
            </div>
            <div className="space-y-1">
              <Label>Subtitle</Label>
              <Input value={hero.subtitle || ""} onChange={(e) => set("hero_section", { ...hero, subtitle: e.target.value })} placeholder="Powerful blend of fitness..." />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Hero Description</Label>
            <Textarea value={hero.description || ""} onChange={(e) => set("hero_section", { ...hero, description: e.target.value })} rows={3} placeholder="Course introduction paragraph..." />
          </div>
          <p className="text-xs text-muted-foreground">Title, description and bullet points are optional; hero is mainly the background image and CTA.</p>
          <FileUpload accept="image/*" label="Hero Background Image" currentUrl={hero.hero_image} onUploaded={(url) => set("hero_section", { ...hero, hero_image: url })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>CTA Button Text</Label>
              <Input value={hero.cta_text || ""} onChange={(e) => set("hero_section", { ...hero, cta_text: e.target.value })} placeholder="Register Now" />
            </div>
            <div className="space-y-1">
              <Label>CTA Button Link</Label>
              <Input value={hero.cta_link || ""} onChange={(e) => set("hero_section", { ...hero, cta_link: e.target.value })} placeholder="/register" />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ---- 2. Course Info Bar ---- */}
      <AccordionItem value="info" className="border rounded-lg px-4">
        <AccordionTrigger className="text-[#4F5077] font-semibold">
          <span className="flex items-center gap-2"><Info className="h-4 w-4" /> Course Info Bar</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Location</Label>
              <Input value={info.location || ""} onChange={(e) => set("course_info", { ...info, location: e.target.value })} placeholder="e.g. Hyderabad" />
            </div>
            <div className="space-y-1">
              <Label>Duration Display</Label>
              <Input value={info.duration || ""} onChange={(e) => set("course_info", { ...info, duration: e.target.value })} placeholder="e.g. 3 Months" />
            </div>
            <div className="space-y-1">
              <Label>Price Display</Label>
              <Input value={info.price || ""} onChange={(e) => set("course_info", { ...info, price: e.target.value })} placeholder="e.g. ₹ 4,500" />
            </div>
            <div className="space-y-1">
              <Label>Training Time</Label>
              <Input value={info.training_time || ""} onChange={(e) => set("course_info", { ...info, training_time: e.target.value })} placeholder="e.g. 6:30am - 8:00am" />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ---- 3. About Section ---- */}
      <AccordionItem value="about" className="border rounded-lg px-4">
        <AccordionTrigger className="text-[#4F5077] font-semibold">
          <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> About Course Section</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4">
          <div className="space-y-1">
            <Label>Section Title</Label>
            <Input value={about.title || ""} onChange={(e) => set("about_section", { ...about, title: e.target.value })} placeholder="Start Today and Change Your Life" />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea value={about.description || ""} onChange={(e) => set("about_section", { ...about, description: e.target.value })} rows={4} placeholder="Main about text..." />
          </div>
          <div className="space-y-1">
            <Label>Secondary Description</Label>
            <Textarea value={about.secondary_description || ""} onChange={(e) => set("about_section", { ...about, secondary_description: e.target.value })} rows={3} placeholder="Additional paragraph..." />
          </div>
          <div className="border-t pt-4 space-y-4">
            <Label className="text-base">Content blocks (custom sections with title, description, bullet points)</Label>
            <p className="text-xs text-muted-foreground">Add sections like &quot;Mental and Spiritual Aspects&quot;, &quot;History of Wushu&quot;, etc. Each can have a custom title, description, and bullet points.</p>
            {(about.content_blocks || []).map((block, blockIdx) => (
              <div key={blockIdx} className="border rounded-lg p-4 space-y-3 relative bg-muted/30">
                <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2 text-red-500" onClick={() => set("about_section", { ...about, content_blocks: (about.content_blocks || []).filter((_, i) => i !== blockIdx) })}><X className="h-4 w-4" /></Button>
                <div className="space-y-1 pr-8">
                  <Label>Block title</Label>
                  <Input value={block.title || ""} onChange={(e) => { const blocks = [...(about.content_blocks || [])]; blocks[blockIdx] = { ...block, title: e.target.value }; set("about_section", { ...about, content_blocks: blocks }) }} placeholder="e.g. Mental and Spiritual Aspects" />
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Textarea value={block.description || ""} onChange={(e) => { const blocks = [...(about.content_blocks || [])]; blocks[blockIdx] = { ...block, description: e.target.value }; set("about_section", { ...about, content_blocks: blocks }) }} rows={3} placeholder="Paragraph for this section..." />
                </div>
                <div className="space-y-1">
                  <Label>Bullet points (optional)</Label>
                  {(block.bullet_points || []).map((bp, i) => (
                    <div key={i} className="flex gap-2 mb-1">
                      <Input value={bp} onChange={(e) => { const arr = [...(block.bullet_points || [])]; arr[i] = e.target.value; const blocks = [...(about.content_blocks || [])]; blocks[blockIdx] = { ...block, bullet_points: arr }; set("about_section", { ...about, content_blocks: blocks }) }} placeholder="e.g. Mindfulness: being present..." />
                      <Button type="button" variant="ghost" size="sm" className="text-red-500 shrink-0" onClick={() => { const arr = (block.bullet_points || []).filter((_, idx) => idx !== i); const blocks = [...(about.content_blocks || [])]; blocks[blockIdx] = { ...block, bullet_points: arr }; set("about_section", { ...about, content_blocks: blocks }) }}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => { const arr = [...(block.bullet_points || []), ""]; const blocks = [...(about.content_blocks || [])]; blocks[blockIdx] = { ...block, bullet_points: arr }; set("about_section", { ...about, content_blocks: blocks }) }}><Plus className="h-4 w-4 mr-1" /> Add bullet</Button>
                </div>
                <FileUpload accept="image/*" label="Block image (optional)" currentUrl={block.image} onUploaded={(url) => { const blocks = [...(about.content_blocks || [])]; blocks[blockIdx] = { ...block, image: url }; set("about_section", { ...about, content_blocks: blocks }) }} />
              </div>
            ))}
            <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => set("about_section", { ...about, content_blocks: [...(about.content_blocks || []), { title: "", description: "", bullet_points: [] }] })}>
              <Plus className="h-4 w-4 mr-2" /> Add content block
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FileUpload accept="image/*" label="Image 1 (right column)" currentUrl={about.image1} onUploaded={(url) => set("about_section", { ...about, image1: url })} />
            <FileUpload accept="image/*" label="Image 2 (right column)" currentUrl={about.image2} onUploaded={(url) => set("about_section", { ...about, image2: url })} />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ---- 3b. Course Info Sections (60-40 / 40-60 alternating) ---- */}
      <AccordionItem value="courseInfoSections" className="border rounded-lg px-4">
        <AccordionTrigger className="text-[#4F5077] font-semibold">
          <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> Course Info Sections ({courseInfoSections.length})</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4">
          <p className="text-xs text-muted-foreground">Add sections with 60% text + 40% image, or 40% image + 60% text. They alternate on the course detail page.</p>
          {courseInfoSections.map((sec, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-3 relative bg-muted/30">
              <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2 text-red-500" onClick={() => set("course_info_sections", courseInfoSections.filter((_, i) => i !== idx))}><X className="h-4 w-4" /></Button>
              <div className="flex gap-4 items-center pr-8">
                <Label>Layout</Label>
                <select value={sec.layout || "text_left"} onChange={(e) => { const arr = [...courseInfoSections]; arr[idx] = { ...sec, layout: e.target.value as "text_left" | "image_left" }; set("course_info_sections", arr) }} className="rounded border px-2 py-1">
                  <option value="text_left">60% text left, 40% image right</option>
                  <option value="image_left">40% image left, 60% text right</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Section title</Label>
                <Input value={sec.title || ""} onChange={(e) => { const arr = [...courseInfoSections]; arr[idx] = { ...sec, title: e.target.value }; set("course_info_sections", arr) }} placeholder="e.g. History of Wushu" />
              </div>
              <div className="space-y-1">
                <Label>Content (paragraph)</Label>
                <Textarea value={sec.content || ""} onChange={(e) => { const arr = [...courseInfoSections]; arr[idx] = { ...sec, content: e.target.value }; set("course_info_sections", arr) }} rows={3} placeholder="Description for this section..." />
              </div>
              <div className="space-y-1">
                <Label>Bullet points (optional)</Label>
                {(sec.bullet_points || []).map((bp, i) => (
                  <div key={i} className="flex gap-2 mb-1">
                    <Input value={bp} onChange={(e) => { const arr = [...(sec.bullet_points || [])]; arr[i] = e.target.value; const sections = [...courseInfoSections]; sections[idx] = { ...sec, bullet_points: arr }; set("course_info_sections", sections) }} placeholder="Bullet point" />
                    <Button type="button" variant="ghost" size="sm" className="text-red-500 shrink-0" onClick={() => { const arr = (sec.bullet_points || []).filter((_, j) => j !== i); const sections = [...courseInfoSections]; sections[idx] = { ...sec, bullet_points: arr }; set("course_info_sections", sections) }}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => { const arr = [...(sec.bullet_points || []), ""]; const sections = [...courseInfoSections]; sections[idx] = { ...sec, bullet_points: arr }; set("course_info_sections", sections) }}><Plus className="h-4 w-4 mr-1" /> Add bullet</Button>
              </div>
              <FileUpload accept="image/*" label="Section image" currentUrl={sec.image} onUploaded={(url) => { const arr = [...courseInfoSections]; arr[idx] = { ...sec, image: url }; set("course_info_sections", arr) }} />
            </div>
          ))}
          <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => set("course_info_sections", [...courseInfoSections, { layout: "text_left", title: "", content: "", bullet_points: [] }])}>
            <Plus className="h-4 w-4 mr-2" /> Add section
          </Button>
        </AccordionContent>
      </AccordionItem>

      {/* ---- 4. Benefits ---- */}
      <AccordionItem value="benefits" className="border rounded-lg px-4">
        <AccordionTrigger className="text-[#4F5077] font-semibold">
          <span className="flex items-center gap-2"><Star className="h-4 w-4" /> Benefits ({benefits.length})</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4">
          {benefits.map((b, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-2 relative">
              <Button type="button" variant="ghost" size="sm" className="absolute top-1 right-1 text-red-500" onClick={() => set("benefits", benefits.filter((_, idx) => idx !== i))}>
                <X className="h-4 w-4" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Title</Label>
                  <Input value={b.title} onChange={(e) => { const n = [...benefits]; n[i] = { ...b, title: e.target.value }; set("benefits", n) }} placeholder="Confidence" />
                </div>
                <div className="space-y-1">
                  <Label>Icon (optional)</Label>
                  <Input value={b.icon || ""} onChange={(e) => { const n = [...benefits]; n[i] = { ...b, icon: e.target.value }; set("benefits", n) }} placeholder="e.g. 💪 or icon name" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea value={b.description} onChange={(e) => { const n = [...benefits]; n[i] = { ...b, description: e.target.value }; set("benefits", n) }} rows={2} />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => set("benefits", [...benefits, { title: "", description: "", icon: "" }])}>
            <Plus className="h-4 w-4 mr-2" /> Add Benefit
          </Button>
        </AccordionContent>
      </AccordionItem>

      {/* ---- 5. Learning Section ---- */}
      <AccordionItem value="learning" className="border rounded-lg px-4">
        <AccordionTrigger className="text-[#4F5077] font-semibold">
          <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> What You Will Learn</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4">
          <div className="space-y-1">
            <Label>Section Title</Label>
            <Input value={learning.title || ""} onChange={(e) => set("learning_section", { ...learning, title: e.target.value })} placeholder="What You Will Learn During Boxing Classes" />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea value={learning.description || ""} onChange={(e) => set("learning_section", { ...learning, description: e.target.value })} rows={4} />
          </div>
          <div className="space-y-1">
            <Label>Video URL (YouTube or uploaded)</Label>
            <Input value={learning.video_url || ""} onChange={(e) => set("learning_section", { ...learning, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
          </div>
          <FileUpload accept="image/*" label="Video Thumbnail" currentUrl={learning.thumbnail} onUploaded={(url) => set("learning_section", { ...learning, thumbnail: url })} />
        </AccordionContent>
      </AccordionItem>

      {/* ---- 6. Gallery ---- */}
      <AccordionItem value="gallery" className="border rounded-lg px-4">
        <AccordionTrigger className="text-[#4F5077] font-semibold">
          <span className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Gallery ({gallery.length} images)</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gallery.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="" className="w-full h-24 object-cover rounded" />
                <Button type="button" variant="destructive" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100" onClick={() => set("gallery_images", gallery.filter((_, idx) => idx !== i))}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <FileUpload accept="image/*" label="Add Gallery Image" currentUrl="" onUploaded={(url) => { if (url) set("gallery_images", [...gallery, url]) }} />
        </AccordionContent>
      </AccordionItem>

      {/* ---- 7. Instructors ---- */}
      <AccordionItem value="instructors" className="border rounded-lg px-4">
        <AccordionTrigger className="text-[#4F5077] font-semibold">
          <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Instructors ({instructors.length})</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4">
          {instructors.map((inst, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-2 relative">
              <Button type="button" variant="ghost" size="sm" className="absolute top-1 right-1 text-red-500" onClick={() => set("instructors", instructors.filter((_, idx) => idx !== i))}>
                <X className="h-4 w-4" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input value={inst.name} onChange={(e) => { const n = [...instructors]; n[i] = { ...inst, name: e.target.value }; set("instructors", n) }} />
                </div>
                <div className="space-y-1">
                  <Label>Designation</Label>
                  <Input value={inst.designation} onChange={(e) => { const n = [...instructors]; n[i] = { ...inst, designation: e.target.value }; set("instructors", n) }} placeholder="Martial Arts - Kung Fu" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Bio</Label>
                <Textarea value={inst.bio || ""} onChange={(e) => { const n = [...instructors]; n[i] = { ...inst, bio: e.target.value }; set("instructors", n) }} rows={2} />
              </div>
              <FileUpload accept="image/*" label="Photo" currentUrl={inst.photo} onUploaded={(url) => { const n = [...instructors]; n[i] = { ...inst, photo: url }; set("instructors", n) }} />
            </div>
          ))}
          <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => set("instructors", [...instructors, { name: "", designation: "", bio: "", photo: "" }])}>
            <Plus className="h-4 w-4 mr-2" /> Add Instructor
          </Button>
        </AccordionContent>
      </AccordionItem>

      {/* ---- 8. Testimonials ---- */}
      <AccordionItem value="testimonials" className="border rounded-lg px-4">
        <AccordionTrigger className="text-[#4F5077] font-semibold">
          <span className="flex items-center gap-2"><Star className="h-4 w-4" /> Success Stories / Testimonials ({testimonials.length})</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4">
          {testimonials.map((t, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-2 relative">
              <Button type="button" variant="ghost" size="sm" className="absolute top-1 right-1 text-red-500" onClick={() => set("testimonials", testimonials.filter((_, idx) => idx !== i))}>
                <X className="h-4 w-4" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input value={t.name} onChange={(e) => { const n = [...testimonials]; n[i] = { ...t, name: e.target.value }; set("testimonials", n) }} />
                </div>
                <div className="space-y-1">
                  <Label>Designation</Label>
                  <Input value={t.designation} onChange={(e) => { const n = [...testimonials]; n[i] = { ...t, designation: e.target.value }; set("testimonials", n) }} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Testimonial Text</Label>
                <Textarea value={t.text} onChange={(e) => { const n = [...testimonials]; n[i] = { ...t, text: e.target.value }; set("testimonials", n) }} rows={3} />
              </div>
              <FileUpload accept="image/*" label="Photo (optional)" currentUrl={t.photo} onUploaded={(url) => { const n = [...testimonials]; n[i] = { ...t, photo: url }; set("testimonials", n) }} />
            </div>
          ))}
          <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => set("testimonials", [...testimonials, { name: "", designation: "", text: "", photo: "" }])}>
            <Plus className="h-4 w-4 mr-2" /> Add Testimonial
          </Button>
        </AccordionContent>
      </AccordionItem>

      {/* ---- 9. PDF Attachments ---- */}
      <AccordionItem value="attachments" className="border rounded-lg px-4">
        <AccordionTrigger className="text-[#4F5077] font-semibold">
          <span className="flex items-center gap-2"><Paperclip className="h-4 w-4" /> PDF Attachments ({attachments.length})</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4">
          {attachments.map((a, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-2 relative">
              <Button type="button" variant="ghost" size="sm" className="absolute top-1 right-1 text-red-500" onClick={() => set("pdf_attachments", attachments.filter((_, idx) => idx !== i))}>
                <X className="h-4 w-4" />
              </Button>
              <div className="space-y-1">
                <Label>Title</Label>
                <Input value={a.title} onChange={(e) => { const n = [...attachments]; n[i] = { ...a, title: e.target.value }; set("pdf_attachments", n) }} placeholder="Course Syllabus" />
              </div>
              <FileUpload accept="application/pdf" label="PDF File" currentUrl={a.file_url} onUploaded={(url) => { const n = [...attachments]; n[i] = { ...a, file_url: url }; set("pdf_attachments", n) }} />
            </div>
          ))}
          <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => set("pdf_attachments", [...attachments, { title: "", file_url: "" }])}>
            <Plus className="h-4 w-4 mr-2" /> Add PDF Attachment
          </Button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

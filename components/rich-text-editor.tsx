"use client"

import type React from "react"

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import FontFamily from "@tiptap/extension-font-family"
import Highlight from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import { useState } from "react"
import {
  Bold,
  Italic,
  UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  Type,
  Palette,
  HighlighterIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder = "Write something..." }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  // Prevent event propagation to stop dialog from closing
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({
        multicolor: true,
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "min-h-[150px] p-3 focus:outline-none rounded-md border border-input bg-background",
        onClick: (e: any) => e.stopPropagation(),
      },
      handleClick: (view, pos, event) => {
        // Stop propagation on all editor clicks
        event.stopPropagation()
        return false
      },
      handleDOMEvents: {
        click: (view, event) => {
          // Stop propagation on all DOM events within the editor
          event.stopPropagation()
          return false
        },
      },
    },
  })

  if (!editor) {
    return null
  }

  const addLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (linkUrl) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
      setLinkUrl("")
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    }
  }

  const addImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl("")
    }
  }

  return (
    <div className="rich-text-editor" onClick={stopPropagation}>
      <div className="border rounded-t-md bg-muted/40 p-1 flex flex-wrap gap-1 items-center" onClick={stopPropagation}>
        {/* Text formatting */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            editor.chain().focus().toggleBold().run()
          }}
          className={editor.isActive("bold") ? "bg-muted" : ""}
          title="Bold"
          type="button"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            editor.chain().focus().toggleItalic().run()
          }}
          className={editor.isActive("italic") ? "bg-muted" : ""}
          title="Italic"
          type="button"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            editor.chain().focus().toggleUnderline().run()
          }}
          className={editor.isActive("underline") ? "bg-muted" : ""}
          title="Underline"
          type="button"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }}
          className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
          title="Heading 1"
          type="button"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }}
          className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
          title="Heading 2"
          type="button"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }}
          className={editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""}
          title="Heading 3"
          type="button"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            editor.chain().focus().toggleBulletList().run()
          }}
          className={editor.isActive("bulletList") ? "bg-muted" : ""}
          title="Bullet List"
          type="button"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            editor.chain().focus().toggleOrderedList().run()
          }}
          className={editor.isActive("orderedList") ? "bg-muted" : ""}
          title="Ordered List"
          type="button"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Alignment */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            editor.chain().focus().setTextAlign("left").run()
          }}
          className={editor.isActive({ textAlign: "left" }) ? "bg-muted" : ""}
          title="Align Left"
          type="button"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            editor.chain().focus().setTextAlign("center").run()
          }}
          className={editor.isActive({ textAlign: "center" }) ? "bg-muted" : ""}
          title="Align Center"
          type="button"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            editor.chain().focus().setTextAlign("right").run()
          }}
          className={editor.isActive({ textAlign: "right" }) ? "bg-muted" : ""}
          title="Align Right"
          type="button"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            editor.chain().focus().setTextAlign("justify").run()
          }}
          className={editor.isActive({ textAlign: "justify" }) ? "bg-muted" : ""}
          title="Justify"
          type="button"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Font family */}
        <Popover>
          <PopoverTrigger asChild onClick={stopPropagation}>
            <Button variant="ghost" size="sm" className="gap-1" title="Font Family" type="button">
              <Type className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:inline-block text-xs">Font</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52" onClick={stopPropagation}>
            <Select
              onValueChange={(value) => {
                editor.chain().focus().setFontFamily(value).run()
              }}
              value={editor.getAttributes("textStyle").fontFamily}
              onOpenChange={(open) => {
                if (open) {
                  // Prevent closing when opening the select
                  setTimeout(() => {
                    const backdrop = document.querySelector("[data-radix-popper-content-wrapper]")
                    if (backdrop) {
                      backdrop.addEventListener("click", (e) => e.stopPropagation(), { once: true })
                    }
                  }, 0)
                }
              }}
            >
              <SelectTrigger onClick={stopPropagation}>
                <SelectValue placeholder="Font family" />
              </SelectTrigger>
              <SelectContent onClick={stopPropagation}>
                <SelectItem value="Arial" onClick={stopPropagation}>
                  Arial
                </SelectItem>
                <SelectItem value="Courier New" onClick={stopPropagation}>
                  Courier New
                </SelectItem>
                <SelectItem value="Georgia" onClick={stopPropagation}>
                  Georgia
                </SelectItem>
                <SelectItem value="Times New Roman" onClick={stopPropagation}>
                  Times New Roman
                </SelectItem>
                <SelectItem value="Verdana" onClick={stopPropagation}>
                  Verdana
                </SelectItem>
              </SelectContent>
            </Select>
          </PopoverContent>
        </Popover>

        {/* Color */}
        <Popover>
          <PopoverTrigger asChild onClick={stopPropagation}>
            <Button variant="ghost" size="sm" className="gap-1" title="Text Color" type="button">
              <Palette className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:inline-block text-xs">Color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52" onClick={stopPropagation}>
            <div className="grid grid-cols-5 gap-1">
              {[
                "#000000",
                "#ef4444",
                "#22c55e",
                "#3b82f6",
                "#a855f7",
                "#f59e0b",
                "#84cc16",
                "#06b6d4",
                "#ec4899",
                "#6b7280",
              ].map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-md border border-input"
                  style={{ backgroundColor: color }}
                  onClick={(e) => {
                    e.stopPropagation()
                    editor.chain().focus().setColor(color).run()
                  }}
                  title={color}
                  type="button"
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Highlight */}
        <Popover>
          <PopoverTrigger asChild onClick={stopPropagation}>
            <Button variant="ghost" size="sm" className="gap-1" title="Highlight" type="button">
              <HighlighterIcon className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:inline-block text-xs">Highlight</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52" onClick={stopPropagation}>
            <div className="grid grid-cols-5 gap-1">
              {[
                "#ffff00",
                "#fecaca",
                "#bbf7d0",
                "#bfdbfe",
                "#e9d5ff",
                "#fed7aa",
                "#d9f99d",
                "#a5f3fc",
                "#fbcfe8",
                "#e5e7eb",
              ].map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-md border border-input"
                  style={{ backgroundColor: color }}
                  onClick={(e) => {
                    e.stopPropagation()
                    editor.chain().focus().toggleHighlight({ color }).run()
                  }}
                  title={color}
                  type="button"
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Link */}
        <Popover>
          <PopoverTrigger asChild onClick={stopPropagation}>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 ${editor.isActive("link") ? "bg-muted" : ""}`}
              title="Link"
              type="button"
            >
              <LinkIcon className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:inline-block text-xs">Link</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" onClick={stopPropagation}>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="flex-1"
                onClick={stopPropagation}
              />
              <Button onClick={addLink} type="button">
                Add
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Image */}
        <Popover>
          <PopoverTrigger asChild onClick={stopPropagation}>
            <Button variant="ghost" size="sm" className="gap-1" title="Image" type="button">
              <ImageIcon className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:inline-block text-xs">Image</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" onClick={stopPropagation}>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1"
                onClick={stopPropagation}
              />
              <Button onClick={addImage} type="button">
                Add
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="bg-background rounded-md shadow-md border border-border p-1 flex gap-1"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              editor.chain().focus().toggleBold().run()
            }}
            className={editor.isActive("bold") ? "bg-muted" : ""}
            type="button"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              editor.chain().focus().toggleItalic().run()
            }}
            className={editor.isActive("italic") ? "bg-muted" : ""}
            type="button"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              editor.chain().focus().toggleUnderline().run()
            }}
            className={editor.isActive("underline") ? "bg-muted" : ""}
            type="button"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} placeholder={placeholder} onClick={stopPropagation} />
    </div>
  )
}

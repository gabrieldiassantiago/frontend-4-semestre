"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
    Bold,
    Italic,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Undo2,
    Redo2,
} from "lucide-react"

interface RichTextEditorProps {
    value: string
    onChange: (html: string) => void
    error?: string
    placeholder?: string
}

export function RichTextEditor({ value, onChange, error, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                // Desabilita atalhos de teclado que podem causar formatação acidental
                keyboardShortcuts: {
                    // Mantém apenas os essenciais, remove outros
                    "Mod-b": () => editor?.chain().focus().toggleBold().run(),
                    "Mod-i": () => editor?.chain().focus().toggleItalic().run(),
                    "Mod-z": () => editor?.chain().focus().undo().run(),
                    "Mod-Shift-z": () => editor?.chain().focus().redo().run(),
                },
            }),
        ],
        content: value,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class:
                    "min-h-64 p-4 text-sm leading-relaxed text-foreground focus:outline-none focus:ring-0 prose prose-sm max-w-none select-text",
                // Garante que a seleção de texto seja padrão
                style: "user-select: text; -webkit-user-select: text;",
            },
        },
        onUpdate: ({ editor }) => {
            // Envia HTML formatado puro para o estado e o backend
            onChange(editor.getHTML())
        },
    })

    if (!editor) return null

    return (
        <div
            className={`overflow-hidden rounded-xl border bg-card transition-colors ${error ? "border-danger" : "border-border focus-within:border-primary"
                }`}
        >
            {/* Barra de Ferramentas */}
            <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface px-3 py-2">
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        editor.chain().focus().toggleBold().run()
                    }}
                    className={`rounded p-1.5 transition-colors ${editor.isActive("bold")
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    title="Negrito (Ctrl+B)"
                >
                    <Bold className="size-4" />
                </button>

                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        editor.chain().focus().toggleItalic().run()
                    }}
                    className={`rounded p-1.5 transition-colors ${editor.isActive("italic")
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    title="Itálico (Ctrl+I)"
                >
                    <Italic className="size-4" />
                </button>

                <span className="mx-1 h-4 w-px bg-border" />

                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }}
                    className={`rounded p-1.5 transition-colors ${editor.isActive("heading", { level: 2 })
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    title="Título Grande"
                >
                    <Heading2 className="size-4" />
                </button>

                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }}
                    className={`rounded p-1.5 transition-colors ${editor.isActive("heading", { level: 3 })
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    title="Subtítulo"
                >
                    <Heading3 className="size-4" />
                </button>

                <span className="mx-1 h-4 w-px bg-border" />

                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        editor.chain().focus().toggleBulletList().run()
                    }}
                    className={`rounded p-1.5 transition-colors ${editor.isActive("bulletList")
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    title="Lista com marcadores"
                >
                    <List className="size-4" />
                </button>

                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        editor.chain().focus().toggleOrderedList().run()
                    }}
                    className={`rounded p-1.5 transition-colors ${editor.isActive("orderedList")
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    title="Lista numerada"
                >
                    <ListOrdered className="size-4" />
                </button>

                <div className="ml-auto flex items-center gap-1">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            editor.chain().focus().undo().run()
                        }}
                        disabled={!editor.can().undo()}
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                        title="Desfazer"
                    >
                        <Undo2 className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            editor.chain().focus().redo().run()
                        }}
                        disabled={!editor.can().redo()}
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                        title="Refazer"
                    >
                        <Redo2 className="size-4" />
                    </button>
                </div>
            </div>

            {/* Área onde o usuário digita e visualiza o texto estilizado */}
            <EditorContent editor={editor} />
        </div>
    )
}
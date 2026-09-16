"use client"

import { useRef, useState } from "react"
import {
    Camera,
    Loader2,
    UserRound,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { uploadCandidateAvatar } from "@/lib/api"
import type { CandidateProfile } from "@/lib/types/candidate.types"

type Props = {
    profile: CandidateProfile
    onProfileUpdated: (profile: CandidateProfile) => void
}

export function ProfilePhotoField({
    profile,
    onProfileUpdated,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null)

    const [previewUrl, setPreviewUrl] = useState<string | null>(
        profile.profileImageUrl ?? null,
    )

    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0]

        if (!file) return

        setError(null)

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ]

        if (!allowedTypes.includes(file.type)) {
            setError("Envie uma imagem PNG, JPEG ou WebP.")
            event.target.value = ""
            return
        }

        const maxSize = 5 * 1024 * 1024

        if (file.size > maxSize) {
            setError("A imagem deve ter no máximo 5 MB.")
            event.target.value = ""
            return
        }

        const localPreview = URL.createObjectURL(file)

        setPreviewUrl(localPreview)
        setUploading(true)

        try {
            const updatedProfile =
                await uploadCandidateAvatar(file)

            setPreviewUrl(
                profile.profileImageUrl ??
                localPreview
            )

            onProfileUpdated(updatedProfile)
        } catch (err) {
            setPreviewUrl(
                profile.profileImageUrl ?? null,
            )

            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível enviar a foto.",
            )
        } finally {
            setUploading(false)

            URL.revokeObjectURL(localPreview)

            if (inputRef.current) {
                inputRef.current.value = ""
            }
        }
    }

    const initials = profile.userName
        ?.trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()

    return (
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
                <button
                    type="button"
                    disabled={uploading}
                    onClick={() =>
                        inputRef.current?.click()
                    }
                    className={cn(
                        "group relative grid size-24 place-items-center overflow-hidden rounded-full",
                        "border-2 border-border bg-muted",
                        "transition-all hover:border-primary/50",
                        uploading &&
                        "cursor-wait opacity-70",
                    )}
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Foto de perfil"
                            className="size-full object-cover"
                        />
                    ) : initials ? (
                        <span className="text-2xl font-bold text-muted-foreground">
                            {initials}
                        </span>
                    ) : (
                        <UserRound className="size-9 text-muted-foreground" />
                    )}

                    <span className="absolute inset-0 grid place-items-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        {uploading ? (
                            <Loader2 className="size-5 animate-spin text-white" />
                        ) : (
                            <Camera className="size-5 text-white" />
                        )}
                    </span>
                </button>

                {!uploading && (
                    <button
                        type="button"
                        onClick={() =>
                            inputRef.current?.click()
                        }
                        className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm"
                    >
                        <Camera className="size-3.5" />
                    </button>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-foreground">
                    Foto de perfil
                </h4>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Use uma imagem profissional em PNG,
                    JPEG ou WebP de até 5 MB.
                </p>

                <button
                    type="button"
                    disabled={uploading}
                    onClick={() =>
                        inputRef.current?.click()
                    }
                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="size-3.5 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Camera className="size-3.5" />
                            {previewUrl
                                ? "Trocar foto"
                                : "Adicionar foto"}
                        </>
                    )}
                </button>

                {error && (
                    <p
                        className="mt-2 text-xs font-medium text-danger-foreground"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={handleFileChange}
            />
        </div>
    )
}
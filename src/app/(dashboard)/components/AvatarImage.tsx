import { useEffect, useState } from 'react'
import Image from 'next/image'

interface AvatarImageProps {
    src?: string | null
    username?: string
    size?: number
    className?: string
}

export default function AvatarImage({
    src,
    username,
    size = 48,
    className = '',
}: AvatarImageProps) {
    const [avatarUrl, setAvatarUrl] = useState<string>('')

    useEffect(() => {
        // ✅ Validasi input src agar tidak salah
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

        let url = ''

        if (src && src !== 'null' && src.trim() !== '') {
            // ✅ Kalau sudah absolute (http...), langsung pakai
            if (src.startsWith('http')) {
                url = src
            } else {
                url = `${baseUrl}${src}`
            }
        } else {
            // ✅ Fallback default avatar generator
            url = `https://avatar.iran.liara.run/public?username=${encodeURIComponent(
                username || 'guest'
            )}`
        }

        setAvatarUrl(url)
    }, [src, username])

    // ✅ Skeleton sementara
    if (!avatarUrl) {
        return (
            <div
                className={`bg-gray-200 animate-pulse rounded-full ${className}`}
                style={{ width: size, height: size }}
            />
        )
    }

    // ✅ Tampilkan avatar dengan ukuran dinamis
    return (
        <Image
            src={avatarUrl}
            alt={username || 'User Avatar'}
            width={size}
            height={size}
            className={`rounded-full object-cover ${className}`}
            unoptimized
            onError={() => {
                // fallback kalau URL error
                setAvatarUrl(
                    `https://avatar.iran.liara.run/public?username=${encodeURIComponent(
                        username || 'guest'
                    )}`
                )
            }}
        />
    )
}

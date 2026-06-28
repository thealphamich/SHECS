'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'

function ToastListenerContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const success = searchParams.get('toast_success')
        const error = searchParams.get('toast_error')

        if (success) {
            toast.success(success)
            // Clean url params
            const params = new URLSearchParams(searchParams.toString())
            params.delete('toast_success')
            const query = params.toString() ? `?${params.toString()}` : ''
            router.replace(`${pathname}${query}`)
        }

        if (error) {
            toast.error(error)
            // Clean url params
            const params = new URLSearchParams(searchParams.toString())
            params.delete('toast_error')
            const query = params.toString() ? `?${params.toString()}` : ''
            router.replace(`${pathname}${query}`)
        }
    }, [searchParams, router, pathname])

    return null
}

export function ToastListener() {
    return (
        <Suspense fallback={null}>
            <ToastListenerContent />
        </Suspense>
    )
}

import { Slot, useRouter, useSegments } from "expo-router"
import { useEffect } from "react"
import { useSession } from "../lib/auth-client"

function AuthGuard({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = useSession()
	const segments = useSegments()
	const router = useRouter()

	useEffect(() => {
		if (isPending) return

		const inAuthGroup = segments[0] === "(auth)"

		if (!session && !inAuthGroup) {
			// Not signed in, redirect to sign-in
			router.replace("/(auth)/sign-in")
		} else if (session && inAuthGroup) {
			// Signed in but on auth screen, redirect to app
			router.replace("/(app)")
		}
	}, [session, isPending, segments, router])

	return <>{children}</>
}

export default function RootLayout() {
	return (
		<AuthGuard>
			<Slot />
		</AuthGuard>
	)
}

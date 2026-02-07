import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"
import { signOut, useSession } from "../../lib/auth-client"

export default function ProfileScreen() {
	const { data: session, isPending } = useSession()

	if (isPending) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<View style={styles.card}>
				<Text style={styles.label}>Name</Text>
				<Text style={styles.value} testID="user-name">
					{session?.user?.name}
				</Text>

				<Text style={styles.label}>Email</Text>
				<Text style={styles.value} testID="user-email">
					{session?.user?.email}
				</Text>

				<Text style={styles.label}>User ID</Text>
				<Text style={[styles.value, styles.mono]} testID="user-id">
					{session?.user?.id}
				</Text>

				<Text style={styles.label}>Session expires</Text>
				<Text style={styles.value} testID="session-expires">
					{session?.session?.expiresAt ? new Date(session.session.expiresAt).toLocaleString() : "—"}
				</Text>
			</View>

			<Pressable style={styles.signOutButton} onPress={() => signOut()} testID="sign-out-button">
				<Text style={styles.signOutText}>Sign Out</Text>
			</Pressable>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		backgroundColor: "#f5f5f5",
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		marginBottom: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	label: {
		fontSize: 12,
		color: "#888",
		textTransform: "uppercase",
		marginBottom: 4,
		marginTop: 16,
	},
	value: {
		fontSize: 16,
		color: "#333",
	},
	mono: {
		fontFamily: "monospace",
		fontSize: 13,
	},
	signOutButton: {
		backgroundColor: "#FF3B30",
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
	},
	signOutText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
})

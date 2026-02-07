import { useRouter } from "expo-router"
import { useState } from "react"
import {
	ActivityIndicator,
	Alert,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native"
import { signIn } from "../../lib/auth-client"

export default function SignInScreen() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const handleSignIn = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Please fill in all fields")
			return
		}

		setLoading(true)
		const { error } = await signIn.email({
			email,
			password,
		})
		setLoading(false)

		if (error) {
			Alert.alert("Sign In Failed", error.message || "Something went wrong")
		}
		// On success, the auth guard in _layout.tsx will redirect to (app)
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Welcome Back</Text>

			<TextInput
				style={styles.input}
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
				testID="email-input"
			/>

			<TextInput
				style={styles.input}
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				testID="password-input"
			/>

			<Pressable
				style={[styles.button, loading && styles.buttonDisabled]}
				onPress={handleSignIn}
				disabled={loading}
				testID="sign-in-button"
			>
				{loading ? (
					<ActivityIndicator color="#fff" />
				) : (
					<Text style={styles.buttonText}>Sign In</Text>
				)}
			</Pressable>

			<Pressable onPress={() => router.push("/(auth)/sign-up")} testID="go-to-sign-up">
				<Text style={styles.link}>Don't have an account? Sign Up</Text>
			</Pressable>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		justifyContent: "center",
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 32,
		textAlign: "center",
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		padding: 14,
		marginBottom: 16,
		fontSize: 16,
	},
	button: {
		backgroundColor: "#007AFF",
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
		marginBottom: 16,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	link: {
		color: "#007AFF",
		textAlign: "center",
		fontSize: 14,
	},
})

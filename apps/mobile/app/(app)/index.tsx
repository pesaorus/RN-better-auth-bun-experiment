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
import { deleteUser, signOut, useSession } from "../../lib/auth-client"

export default function ProfileScreen() {
  const { data: session, isPending } = useSession()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [password, setPassword] = useState("")
  const [deleting, setDeleting] = useState(false)

  if (isPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  const handleDeleteAccount = async () => {
    if (!password) {
      Alert.alert("Error", "Please enter your password to confirm")
      return
    }

    setDeleting(true)
    const { error } = await deleteUser({ password })
    setDeleting(false)

    if (error) {
      Alert.alert("Delete Failed", error.message || "Could not delete account")
    }
    // On success, session is invalidated and auth guard redirects to sign-in
  }

  const confirmDelete = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent and cannot be undone. All your data will be deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => setShowDeleteConfirm(true),
        },
      ],
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
        <Text style={styles.buttonText}>Sign Out</Text>
      </Pressable>

      {!showDeleteConfirm ? (
        <Pressable
          style={styles.deleteButton}
          onPress={confirmDelete}
          testID="delete-account-button"
        >
          <Text style={styles.buttonText}>Delete Account</Text>
        </Pressable>
      ) : (
        <View style={styles.deleteConfirmCard} testID="delete-confirm-section">
          <Text style={styles.deleteWarning}>
            Enter your password to permanently delete your account
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            testID="delete-password-input"
          />
          <View style={styles.deleteActions}>
            <Pressable
              style={styles.cancelButton}
              onPress={() => {
                setShowDeleteConfirm(false)
                setPassword("")
              }}
              testID="delete-cancel-button"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmDeleteButton, deleting && styles.buttonDisabled]}
              onPress={handleDeleteAccount}
              disabled={deleting}
              testID="delete-confirm-button"
            >
              {deleting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Delete Forever</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}
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
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteConfirmCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  deleteWarning: {
    fontSize: 14,
    color: "#FF3B30",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  deleteActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelText: {
    fontSize: 16,
    color: "#333",
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: "#FF3B30",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})

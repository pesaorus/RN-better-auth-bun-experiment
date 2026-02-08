import { fireEvent, render } from "@testing-library/react-native"

// Mock expo-router
jest.mock("expo-router", () => ({
	useRouter: () => ({
		push: jest.fn(),
		replace: jest.fn(),
	}),
	useSegments: () => ["(app)"],
}))

const mockSignOut = jest.fn()
const mockDeleteUser = jest.fn().mockResolvedValue({ error: null })
const mockSession = {
	user: {
		id: "user-123",
		name: "Test User",
		email: "test@example.com",
	},
	session: {
		expiresAt: "2026-03-01T00:00:00.000Z",
	},
}

jest.mock("../../lib/auth-client", () => ({
	useSession: () => ({ data: mockSession, isPending: false }),
	signOut: () => mockSignOut(),
	deleteUser: (...args: unknown[]) => mockDeleteUser(...args),
}))

// Mock Alert
jest.spyOn(require("react-native").Alert, "alert")

import ProfileScreen from "../../app/(app)/index"

describe("ProfileScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it("renders user info from session", () => {
		const { getByTestId } = render(<ProfileScreen />)

		expect(getByTestId("user-name").props.children).toBe("Test User")
		expect(getByTestId("user-email").props.children).toBe("test@example.com")
		expect(getByTestId("user-id").props.children).toBe("user-123")
	})

	it("renders sign out and delete account buttons", () => {
		const { getByTestId } = render(<ProfileScreen />)
		expect(getByTestId("sign-out-button")).toBeTruthy()
		expect(getByTestId("delete-account-button")).toBeTruthy()
	})

	it("calls signOut on sign out button press", () => {
		const { getByTestId } = render(<ProfileScreen />)

		fireEvent.press(getByTestId("sign-out-button"))
		expect(mockSignOut).toHaveBeenCalled()
	})

	it("shows confirmation alert when delete account is pressed", () => {
		const Alert = require("react-native").Alert
		const { getByTestId } = render(<ProfileScreen />)

		fireEvent.press(getByTestId("delete-account-button"))

		expect(Alert.alert).toHaveBeenCalledWith(
			"Delete Account",
			"This action is permanent and cannot be undone. All your data will be deleted.",
			expect.arrayContaining([
				expect.objectContaining({ text: "Cancel" }),
				expect.objectContaining({ text: "Continue", style: "destructive" }),
			]),
		)
	})

	it("shows password input after confirming delete", () => {
		const Alert = require("react-native").Alert
		const { getByTestId, queryByTestId } = render(<ProfileScreen />)

		// Initially no delete confirm section
		expect(queryByTestId("delete-confirm-section")).toBeNull()

		// Press delete button
		fireEvent.press(getByTestId("delete-account-button"))

		// Simulate pressing "Continue" in the alert
		const alertCall = Alert.alert.mock.calls[0]
		const continueButton = alertCall[2].find((btn: { text: string }) => btn.text === "Continue")
		continueButton.onPress()

		// Now the confirmation section should be visible
		expect(getByTestId("delete-confirm-section")).toBeTruthy()
		expect(getByTestId("delete-password-input")).toBeTruthy()
		expect(getByTestId("delete-confirm-button")).toBeTruthy()
		expect(getByTestId("delete-cancel-button")).toBeTruthy()
	})

	it("hides password input when cancel is pressed", () => {
		const Alert = require("react-native").Alert
		const { getByTestId, queryByTestId } = render(<ProfileScreen />)

		// Show the confirm section
		fireEvent.press(getByTestId("delete-account-button"))
		const continueButton = Alert.alert.mock.calls[0][2].find(
			(btn: { text: string }) => btn.text === "Continue",
		)
		continueButton.onPress()
		expect(getByTestId("delete-confirm-section")).toBeTruthy()

		// Press cancel
		fireEvent.press(getByTestId("delete-cancel-button"))
		expect(queryByTestId("delete-confirm-section")).toBeNull()
	})
})

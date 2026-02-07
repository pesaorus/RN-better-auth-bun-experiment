import { fireEvent, render, waitFor } from "@testing-library/react-native"

// Mock expo-router
jest.mock("expo-router", () => ({
	useRouter: () => ({
		push: jest.fn(),
		replace: jest.fn(),
		back: jest.fn(),
	}),
	useSegments: () => ["(auth)"],
}))

// Mock auth client
const mockSignIn = jest.fn().mockResolvedValue({ error: null })
jest.mock("../../lib/auth-client", () => ({
	signIn: { email: (...args: unknown[]) => mockSignIn(...args) },
	useSession: () => ({ data: null, isPending: false }),
}))

// Mock Alert
jest.spyOn(require("react-native").Alert, "alert")

import SignInScreen from "../../app/(auth)/sign-in"

describe("SignInScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it("renders all inputs and buttons", () => {
		const { getByTestId, getByText } = render(<SignInScreen />)

		expect(getByTestId("email-input")).toBeTruthy()
		expect(getByTestId("password-input")).toBeTruthy()
		expect(getByTestId("sign-in-button")).toBeTruthy()
		expect(getByText("Welcome Back")).toBeTruthy()
		expect(getByTestId("go-to-sign-up")).toBeTruthy()
	})

	it("shows alert when fields are empty", () => {
		const { getByTestId } = render(<SignInScreen />)
		const Alert = require("react-native").Alert

		fireEvent.press(getByTestId("sign-in-button"))

		expect(Alert.alert).toHaveBeenCalledWith("Error", "Please fill in all fields")
		expect(mockSignIn).not.toHaveBeenCalled()
	})

	it("calls signIn.email with credentials", async () => {
		const { getByTestId } = render(<SignInScreen />)

		fireEvent.changeText(getByTestId("email-input"), "test@example.com")
		fireEvent.changeText(getByTestId("password-input"), "password1234")
		fireEvent.press(getByTestId("sign-in-button"))

		await waitFor(() => {
			expect(mockSignIn).toHaveBeenCalledWith({
				email: "test@example.com",
				password: "password1234",
			})
		})
	})

	it("shows error alert on sign-in failure", async () => {
		mockSignIn.mockResolvedValueOnce({
			error: { message: "Invalid credentials" },
		})
		const Alert = require("react-native").Alert

		const { getByTestId } = render(<SignInScreen />)

		fireEvent.changeText(getByTestId("email-input"), "test@example.com")
		fireEvent.changeText(getByTestId("password-input"), "wrongpass")
		fireEvent.press(getByTestId("sign-in-button"))

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith("Sign In Failed", "Invalid credentials")
		})
	})
})

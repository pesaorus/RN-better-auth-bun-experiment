import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => ["(auth)"],
}));

// Mock auth client
const mockSignUp = jest.fn().mockResolvedValue({ error: null });
jest.mock("../../lib/auth-client", () => ({
  signUp: { email: (...args: unknown[]) => mockSignUp(...args) },
  useSession: () => ({ data: null, isPending: false }),
}));

// Mock Alert
jest.spyOn(require("react-native").Alert, "alert");

import SignUpScreen from "../../app/(auth)/sign-up";

describe("SignUpScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all inputs and buttons", () => {
    const { getByTestId, getByText } = render(<SignUpScreen />);

    expect(getByTestId("name-input")).toBeTruthy();
    expect(getByTestId("email-input")).toBeTruthy();
    expect(getByTestId("password-input")).toBeTruthy();
    expect(getByTestId("sign-up-button")).toBeTruthy();
    expect(getByText("Create Account")).toBeTruthy();
    expect(getByTestId("go-to-sign-in")).toBeTruthy();
  });

  it("shows alert when fields are empty", () => {
    const { getByTestId } = render(<SignUpScreen />);
    const Alert = require("react-native").Alert;

    fireEvent.press(getByTestId("sign-up-button"));

    expect(Alert.alert).toHaveBeenCalledWith("Error", "Please fill in all fields");
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("shows alert for short password", () => {
    const { getByTestId } = render(<SignUpScreen />);
    const Alert = require("react-native").Alert;

    fireEvent.changeText(getByTestId("name-input"), "Test");
    fireEvent.changeText(getByTestId("email-input"), "test@example.com");
    fireEvent.changeText(getByTestId("password-input"), "short");
    fireEvent.press(getByTestId("sign-up-button"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Password must be at least 8 characters"
    );
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("calls signUp.email with valid data", async () => {
    const { getByTestId } = render(<SignUpScreen />);

    fireEvent.changeText(getByTestId("name-input"), "Test User");
    fireEvent.changeText(getByTestId("email-input"), "test@example.com");
    fireEvent.changeText(getByTestId("password-input"), "password1234");
    fireEvent.press(getByTestId("sign-up-button"));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        password: "password1234",
      });
    });
  });

  it("shows error alert on sign-up failure", async () => {
    mockSignUp.mockResolvedValueOnce({
      error: { message: "Email already taken" },
    });
    const Alert = require("react-native").Alert;

    const { getByTestId } = render(<SignUpScreen />);

    fireEvent.changeText(getByTestId("name-input"), "Test");
    fireEvent.changeText(getByTestId("email-input"), "taken@example.com");
    fireEvent.changeText(getByTestId("password-input"), "password1234");
    fireEvent.press(getByTestId("sign-up-button"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Sign Up Failed",
        "Email already taken"
      );
    });
  });
});

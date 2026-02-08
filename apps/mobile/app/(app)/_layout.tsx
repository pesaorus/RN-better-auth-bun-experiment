import { Stack } from "expo-router"

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Profile" }} />
    </Stack>
  )
}

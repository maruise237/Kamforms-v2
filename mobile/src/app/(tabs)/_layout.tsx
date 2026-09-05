import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { FileText, Inbox, Settings } from "lucide-react-native";
import { typography } from "@/theme";
import { useTheme } from "@/context/ThemeContext";

export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { colors } = useTheme();

  if (isLoaded && !isSignedIn) return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.graphite,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: colors.signal,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontSize: 10.5, fontFamily: typography.fontFamily.bodyMedium },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Formulaires", tabBarIcon: ({ color, size }) => <FileText size={size} color={color} /> }} />
      <Tabs.Screen name="reponses" options={{ title: "Réponses", tabBarIcon: ({ color, size }) => <Inbox size={size} color={color} /> }} />
      <Tabs.Screen name="parametres" options={{ title: "Paramètres", tabBarIcon: ({ color, size }) => <Settings size={size} color={color} /> }} />
    </Tabs>
  );
}

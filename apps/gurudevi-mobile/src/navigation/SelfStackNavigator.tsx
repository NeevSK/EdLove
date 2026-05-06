import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AIAssistantScreen as AIAssistant } from "@repo/ai";
import { SelfScreen as SelfMain } from "@repo/self";

const Stack = createNativeStackNavigator();

export default function SelfStackNavigator() {
	return (
		<Stack.Navigator id="SelfStack" screenOptions={{ headerShown: false }}>
			<Stack.Screen name="SelfMain" component={SelfMain} />
			<Stack.Screen name="AIAssistant" component={AIAssistant} />
		</Stack.Navigator>
	);
}

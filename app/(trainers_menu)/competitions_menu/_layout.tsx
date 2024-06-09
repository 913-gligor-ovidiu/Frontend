import { Stack } from "expo-router";


const CompetitionLayout = () => {
    return (
        <Stack
        screenOptions={{
            headerStyle: {
                backgroundColor: '#10101E',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
            }
        }>
        <Stack.Screen name="competitions" options={{headerTitle: 'Manage Competitions', headerShown:false}} />
        <Stack.Screen name="create_competition" options={{headerShown: false}} />
        <Stack.Screen name="[id]" options={{headerTitle: 'Competition Details', headerBackTitle:'Back'}} />
        </Stack>
    )
};

export default CompetitionLayout;
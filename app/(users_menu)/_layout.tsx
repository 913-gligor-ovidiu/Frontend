import {Tabs} from 'expo-router'
import {FontAwesome} from 'expo-vector-icons'
import { FontAwesome6 } from '@expo/vector-icons';

export default () => {
    return (
        <Tabs>
            <Tabs.Screen 
                name="appointments"
                options={{
                    tabBarLabel: 'Appointments',
                    headerTitle: 'Manage Users',
                    tabBarIcon: ({color,size}) => <FontAwesome name='list' size={size} color={color} />
                }}
            />
            <Tabs.Screen 
                name="competition_screen"
                options={{
                    tabBarLabel: 'Competitions',
                    headerTitle: 'Manage Competitions',
                    tabBarIcon: ({color,size}) => <FontAwesome name='trophy' size={size} color={color} />
                }}
            />
            <Tabs.Screen
                name="workout"
                options={{
                    tabBarLabel: 'Workout',
                    headerTitle: 'Workout',
                    tabBarIcon: ({color,size}) => <FontAwesome6 name='dumbbell' size={size} color={color} />
                }}
            />
            <Tabs.Screen
                name="competition_history"
                options={{
                    headerTitle: 'Competition History',
                    tabBarLabel: 'History',
                    tabBarIcon: ({color,size}) => <FontAwesome name="history" size={size} color={color} />
                }}
            />
            <Tabs.Screen 
                name="user_profile"
                options={{
                    tabBarLabel: 'Profile',
                    headerTitle: 'Profile',
                    tabBarIcon: ({color,size}) => <FontAwesome name='user' size={size} color={color} />
                }}
            />
            <Tabs.Screen
                name="[userid]"
                options={{
                    href: null,
                    headerTitle: 'User Profile',
                }}
            />
        </Tabs>
    )
}
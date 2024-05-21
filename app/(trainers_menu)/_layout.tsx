import {Tabs} from 'expo-router'
import { FontAwesome } from '@expo/vector-icons';

export default () => {
    return (
        <Tabs>
            <Tabs.Screen 
                name="users"
                options={{
                    tabBarLabel: 'List',
                    headerTitle: 'Manage Users Appointments',
                    tabBarIcon: ({color,size}) => <FontAwesome name='list' size={size} color={color} />
                }}
            />
            <Tabs.Screen 
                name="competitions"
                options={{
                    tabBarLabel: 'Competitions',
                    headerTitle: 'Manage Competitions',
                    tabBarIcon: ({color,size}) => <FontAwesome name='trophy' size={size} color={color} />
                }}
            />
            <Tabs.Screen 
                name="profile"
                options={{
                    tabBarLabel: 'Profile',
                    headerTitle: 'Profile',
                    tabBarIcon: ({color,size}) => <FontAwesome name='user' size={size} color={color} />
                }}
            />
            <Tabs.Screen
                name="create_competition"
                options={{
                    href: null,
                    headerTitle: 'Create Competition',
                }}
            />
        </Tabs>
    )
}
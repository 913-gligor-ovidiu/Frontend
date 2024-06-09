import { Stack, useRouter } from "expo-router"
import { useEffect, useState } from "react";
import { View, Text} from "react-native"
import * as SecureStore from 'expo-secure-store';
import 'react-native-reanimated';


const StackLayout = () => {
    const router = useRouter();

    useEffect(() => {
      let isMounted = true; 
  
      const checkLogin = async () => {
        const token = await SecureStore.getItemAsync('token');
        const userJson = await SecureStore.getItemAsync('user');
  
        if (isMounted && token && userJson) {
          const user = JSON.parse(userJson);
          if (user.isAdmin) {
            router.replace('/users'); 
          } else {
            router.replace('/workout'); 
          }
        } else if (isMounted) {
          router.replace('/'); 
        }
      };
  
      checkLogin();
      return () => {
        isMounted = false;
      };
    }, []);
  

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
        <Stack.Screen name="index" options={{headerTitle: 'Login', headerShown:false}} />
        <Stack.Screen name="register" options={{headerTitle: 'Register'}} />
        <Stack.Screen name="(trainers_menu)" options={{headerTitle: 'Trainers Menu'}} />
        <Stack.Screen name="(users_menu)" options={{headerTitle: 'Users Menu'}} />
        </Stack>
    )
}

export default StackLayout
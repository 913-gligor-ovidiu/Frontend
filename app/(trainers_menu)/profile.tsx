import { Link, useRouter } from "expo-router"
import { Button, View, StyleSheet, Pressable, Text } from "react-native"
import * as SecureStore from 'expo-secure-store';

const ProfilePage = () => {
    const router = useRouter();

    const logOut = async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
        const token = await SecureStore.getItemAsync('token');
      const userJson = await SecureStore.getItemAsync('user');
      console.log("Token:", token);
      console.log("User:", userJson);
        router.replace('/');
    }
    return (
        <View style = {{flex:1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827'}}>
             <Pressable style={styles.button} onPress={logOut}>
                    <Text style={styles.buttonText}>Logout</Text>
             </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#1e90ff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: 'bold',
    },
})

export default ProfilePage
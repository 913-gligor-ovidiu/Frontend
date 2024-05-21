import { Link, useRouter } from "expo-router"
import { Button, View } from "react-native"
import * as SecureStore from 'expo-secure-store';

const ProfilePage = () => {
    const router = useRouter();

    const logOut = async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
        const token = await SecureStore.getItemAsync('token');
      // Assume 'user' contains the role information to decide which menu to go to
      const userJson = await SecureStore.getItemAsync('user');
      console.log("Token:", token);
      console.log("User:", userJson);
        router.replace('/');
    }
    return (
        <View style = {{flex:1, justifyContent: 'center', alignItems: 'center'}}>
            <Button title="Log out" onPress={logOut} />
        </View>
    )
}

export default ProfilePage
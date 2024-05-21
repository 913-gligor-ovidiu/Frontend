import { Pressable, StyleSheet, Text, TextInput, View, ScrollView } from "react-native";
import { useState } from "react"; 
import { Link, useRouter } from "expo-router";
import { styles } from "./styles/register_style"; // Importing styles from the provided file
import { loginUser } from "./Logic/loginService";
import * as SecureStore from 'expo-secure-store';

const LoginPage = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please fill in all fields");
      return;
    }
    
    const userData = { username, password };
    const loginResult = await loginUser(userData);
  
    if (loginResult.user && loginResult.token) {
      alert("Login successful");
      
      // Extract user details
      const userJson = await SecureStore.getItemAsync('user');
      const user = JSON.parse(userJson);
      if (user.isAdmin) {
        router.replace('/users'); // Admins go to the users management page
      } else {
        router.replace('/workout'); // Regular users go to the workout page
      }
    } else {
      alert("Login failed: " + loginResult);
    }
  };
  


  return (
    <ScrollView contentContainerStyle={{flexGrow: 2}}>
    <View style={[styles.container, styles.scrollContainer]}>
      <View style={styles.inner}>
        <Text style={styles.title}>Login</Text>
        
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              onChangeText={text => setUsername(text)}
              value={username}
              placeholder="Enter your username"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              onChangeText={text => setPassword(text)}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry={true}
            />
          </View>
        </View>
        
        <Pressable style={styles.registerButton} onPress={handleLogin}>
          <Text style={styles.registerButtonText}>Login</Text>
        </Pressable>
        
        <Text style={{ marginTop: 20 }}>Don't have an account? <Link href={'/register'} style={{ color: 'blue' }}>Register here!</Link></Text>
      </View>
    </View>
    </ScrollView>
  );
}

export default LoginPage;

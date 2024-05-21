import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Button, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { styles } from "./styles/register_style";
import { registerUser } from "./Logic/registrationService";
import { useRouter } from "expo-router";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [age, setAge] = useState(0);
  const [height, setHeight] = useState(0);
  const [weight, setWeight] = useState(0);
  const [sex, setSex] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  const handleRegister = async () => {
    // Validate input
    if (!firstName || !lastName || !userName || !age || !height || !weight || !sex || !password) {
      alert("Please fill in all fields");
      return;
    }
    
    // Prepare user data
    const userData = {
      firstName,
      lastName,
      userName,
      password,
      age,
      height,
      weight,
      sex,
    };

    const registrationResult = await registerUser(userData);
    if (registrationResult == true) {
      alert("Registration successful");
      //router.replace("/");
      router.back();
    } else {
      alert("Registration failed: " + registrationResult);
    }

  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.inner}>
          <Text style={styles.title}>Register</Text>
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => setFirstName(text)}
                value={firstName}
                placeholder="Enter your first name"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => setLastName(text)}
                value={lastName}
                placeholder="Enter your last name"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => setUserName(text)}
                value={userName}
                placeholder="Enter your desired username"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => setPassword(text)}
                value={password}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry={true}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  const parsedValue = parseInt(text);
                  if (!isNaN(parsedValue)) {
                    setAge(parsedValue);
                  } else {
                    setAge(0); // Clear the age if the input is not a valid number
                  }
                }}
                value={age.toString()}
                placeholder="Enter your age"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                onChangeText={text =>{
                  const parsedValue = parseInt(text);
                  if (!isNaN(parsedValue)) {
                    setHeight(parsedValue);
                  } else {
                    setHeight(0); // Clear the height if the input is not a valid number
                  }
                } }
                value={height.toString()}
                placeholder="Enter your height"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  const parsedValue = parseInt(text);
                  if (!isNaN(parsedValue)) {
                    setWeight(parsedValue);
                  } else {
                    setWeight(0); // Clear the weight if the input is not a valid number
                  }
                }}
                value={weight.toString()}
                placeholder="Enter your weight"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Sex</Text>
              <View style={styles.radioContainer}>
                <TouchableOpacity style={styles.radioButton} onPress={() => setSex("male")}>
                  <Text style={sex === "male" ? styles.radioTextSelected : styles.radioText}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.radioButton} onPress={() => setSex("female")}>
                  <Text style={sex === "female" ? styles.radioTextSelected : styles.radioText}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterPage;

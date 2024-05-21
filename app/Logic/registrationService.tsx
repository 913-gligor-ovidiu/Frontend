import Constants from 'expo-constants';
import { API_URL } from '../constants';

export const registerUser = async (userData) => {
  let objData = {
    firstName: userData.firstName,
    lastName: userData.lastName,
    userName: userData.userName,
    password: userData.password,
    age: userData.age,
    height: userData.height,
    weight: userData.weight,
    sex: userData.sex,
  };
  const url = `${API_URL}/Users/register`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json-patch+json',
      },
      body: JSON.stringify(objData),
    });

    if (response.status >= 200 && response.status < 300) {
      return true; // Registration successful
    } else {
      const errorMessage = await response.text(); // Extract error message from response
      return errorMessage; // Return error message
    }
  } catch (error) {
    console.error('Error registering user:', error);
    return error.message; // Return error message
  }
};
  
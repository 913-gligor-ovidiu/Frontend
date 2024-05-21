import Constants from 'expo-constants';
import { API_URL } from '../constants';
import * as SecureStore from 'expo-secure-store';

export const loginUser = async (userData) => {
  const url = `${API_URL}/Users/login`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const data = await response.json();
      await SecureStore.setItemAsync('token', data.token);  // Save the token securely
      await SecureStore.setItemAsync('user', JSON.stringify(data.user));  // Save user details securely
      return data;  // Return the full data for further processing
    } else {
      const errorMessage = await response.text();
      return errorMessage;  // Return error message
    }
  } catch (error) {
    console.error('Error during login:', error);
    return error.message;  // Return error message
  }
};

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
      await SecureStore.setItemAsync('token', data.token);  
      await SecureStore.setItemAsync('user', JSON.stringify(data.user));  
      return data;  
    } else {
      const errorMessage = await response.text();
      return errorMessage;  
    }
  } catch (error) {
    console.error('Error during login:', error);
    return error.message;  
  }
};

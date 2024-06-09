import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants';

export const createCompetition = async (competitionData) => {
    const url = `${API_URL}/competitions`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await SecureStore.getItemAsync('token')}`, 
            },
            body: JSON.stringify(competitionData),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Competition Created Successfully:', data);
            return { success: true, data: data };  
        } else {
            const errorMessage = await response.text();
            alert('Failed to create competition: ' + errorMessage);
            return { success: false, message: errorMessage };  
        }
    } catch (error) {
        console.error('Error creating competition:', error);
        alert('Failed to create competition. Please try again.');
        return { success: false, message: error.message };  
    }
};

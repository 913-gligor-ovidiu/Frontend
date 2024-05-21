import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    userAppointment: {
        fontSize: 14,
        marginTop: 4,
        color: '#555', // a lighter shade than the name to distinguish the text
    },
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    userList: {
        marginTop: 10,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: 15,
        marginVertical: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      userInfo: {
        flex: 1,
        marginRight: 10,
      },
      userName: {
        fontWeight: 'bold',
        fontSize: 16,
      },
      userDate: {
        fontSize: 14,
      },
      disableButton: {
        backgroundColor: '#ff4757',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
        alignSelf: 'center', // Align button to the center of the container vertically
      },
      disableButtonText: {
        color: 'white',
        fontSize: 14,
      },
      resetButton: {
        marginTop: 10,
      },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
});
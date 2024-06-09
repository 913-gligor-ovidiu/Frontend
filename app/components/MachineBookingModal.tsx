import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, Image } from 'react-native';
import { CheckBox } from '@rneui/base';
import DropDownPicker from 'react-native-dropdown-picker';

const exerciseImages = {
  "Calf Raises": require('../assets/AparatGambe.jpg'),
  "TreadMill": require('../assets/Banda.jpg'),
  "Leg Press": require('../assets/PresaPicioare.jpg'),
  "Bench Press": require('../assets/PresaPiept.jpg'),
  "Shoulder Press": require('../assets/PresaUmeri.jpg'),
  "RowingMachine": require('../assets/Ramat.jpg'),
  "Lateral Raises": require('../assets/RidicariUmeri.jpg'),
  "StepMachine": require('../assets/StepMachine.jpg'),
};


const MachineBookingModal = ({ visible, onClose, hour, machines, slots, onBook }) => {
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    setSelectedMachines([]);
    setTotalMinutes(0);
    setOpenDropdown(null);
  }, [visible]);

  useEffect(() => {
    const newTotalMinutes = selectedMachines.reduce((total, { machineId, slotCount }) => {
      const machine = machines.find(m => m.id === machineId);
      const minutesPerSlot = machine.type === 'Strength' ? 15 : 30;
      return total + (slotCount * minutesPerSlot);
    }, 0);
    setTotalMinutes(newTotalMinutes);
  }, [selectedMachines, machines]);

  const handleSelectMachine = (machineId, slotCount) => {
    setSelectedMachines(prevSelected => {
      const updatedSelection = prevSelected.map(m =>
        m.machineId === machineId ? { ...m, slotCount } : m
      );
      return updatedSelection;
    });
  };

  const handleCheckboxToggle = (machineId) => {
    setSelectedMachines(prevSelected => {
      const isSelected = prevSelected.some(m => m.machineId === machineId);
      if (isSelected) {
        return prevSelected.filter(m => m.machineId !== machineId);
      } else {
        return [...prevSelected, { machineId, slotCount: 1 }];
      }
    });
  };

  const handleBook = () => {
    if (selectedMachines.length > 0 && totalMinutes <= 60) {
      const machineBookings = selectedMachines.map(({ machineId, slotCount }) => {
        const machine = machines.find(m => m.id === machineId);
        return {
          MachineId: machine.id,
          MachineName: machine.name,
          Type: machine.type,
          SlotCount: slotCount
        };
      });
      onBook(hour, machineBookings);
      setSelectedMachines([]);
      setTotalMinutes(0);
      onClose();
    } else {
      Alert.alert("Please ensure your total booking time is 60 minutes or less and at least one machine is selected.");
    }
  };

  const getPickerItems = (machineId) => {
    const slot = slots.find(s => s.machineId === machineId);
    const machine = machines.find(m => m.id === machineId);
    const minutesPerSlot = machine.type === 'Strength' ? 15 : 30;
    const remainingMinutes = 60 - totalMinutes + (selectedMachines.find(m => m.machineId === machineId)?.slotCount || 0) * minutesPerSlot;
    const items = [];

    if (slot.slotsLeft >= 1 && remainingMinutes >= minutesPerSlot) {
      items.push({ label: '1 slot', value: 1 });
    }
    if (slot.slotsLeft >= 2 && remainingMinutes >= 2 * minutesPerSlot) {
      items.push({ label: '2 slots', value: 2 });
    }
    return items;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Book Machines for {hour}:00</Text>
          <Text style={styles.totalMinutesText}>Total Minutes: {totalMinutes}</Text>
          <ScrollView contentContainerStyle={styles.scrollView}>
            {slots.map((slot, index) => {
              const machine = machines.find((m) => m.id === slot.machineId);
              const selectedValue = selectedMachines.find(m => m.machineId === machine.id)?.slotCount || 1;
              const isSelected = selectedMachines.some(m => m.machineId === machine.id);
              const minutesPerSlot = machine.type === 'Strength' ? 15 : 30;
              const remainingMinutes = 60 - totalMinutes + (isSelected ? selectedValue * minutesPerSlot : 0);
              const isDisabled = remainingMinutes < minutesPerSlot && !isSelected || slot.slotsLeft === 0;

              return (
                <View key={machine.id} style={[styles.machineContainer, { zIndex: slots.length - index }]}>
                  <View style={styles.imageContainer}>
                    <Image 
                    source={exerciseImages[machine.name]} 
                    style={styles.machineImage} 
                    resizeMode='contain'/>
                  </View>
                  <View style={styles.machineInfoContainer}>
                    <CheckBox
                      checked={isSelected}
                      onPress={() => handleCheckboxToggle(machine.id)}
                      title={machine.name}
                      disabled={isDisabled}
                      containerStyle={isDisabled ? styles.disabledCheckbox : null}
                    />
                    <Text style={styles.slotsLeftText}>{`(${slot.slotsLeft} slots left)`}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.pickerContainer}>
                      <DropDownPicker
                        listMode='SCROLLVIEW'
                        open={openDropdown === machine.id}
                        value={selectedValue}
                        items={getPickerItems(machine.id)}
                        setOpen={(open) => setOpenDropdown(open ? machine.id : null)}
                        setValue={(callback) => {
                          const value = callback(selectedValue);
                          handleSelectMachine(machine.id, value);
                        }}
                        style={[styles.picker, { zIndex: 1000 }]}
                        dropDownContainerStyle={[styles.dropdown, { zIndex: 1000 }]}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
              <Text style={styles.buttonText}>Book</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: Dimensions.get('window').height * 0.8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d4059',
    marginBottom: 10,
  },
  totalMinutesText: {
    fontSize: 16,
    marginBottom: 10,
  },
  scrollView: {
    paddingBottom: 100,  
  },
  machineContainer: {
    marginBottom: 10,
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: 150,
    marginBottom: 5,
  },
  machineImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 5,
  },
  machineInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotsLeftText: {
    marginLeft: 10,
    color: '#555',
  },
  pickerContainer: {
    marginTop: 5,
    width: '100%',
  },
  picker: {
    width: '100%',
  },
  dropdown: {
    width: '100%',
  },
  disabledCheckbox: {
    opacity: 0.5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  bookButton: {
    padding: 10,
    backgroundColor: '#2a9d8f',
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#d9534f',
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MachineBookingModal;


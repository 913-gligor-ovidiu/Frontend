import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { Table, TableWrapper, Row, Cell } from 'react-native-table-component';

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

const ScheduleModal = ({ visible, onClose, date, machines, appointmentsData, workingHours }) => {
  const renderScheduleTable = () => {
    const tableHead = ['Hour/Machine', ...machines.map(machine => exerciseImages[machine.name])];
    const widthArr = [100, ...machines.map(() => 100)];
    const tableData = [];

    for (let hour = workingHours.startHour; hour < workingHours.endHour; hour++) {
      const rowData = [`${hour}:00`];

      machines.forEach(machine => {
        const hourData = appointmentsData.find(slot => slot.hour === hour) || {};
        const machineAvailability = (hourData.machineAvailabilities || []).find(m => m.machineId === machine.id) || {};
        const slotsLeft = machineAvailability.slotCount !== undefined ? machineAvailability.slotCount : (machine.type === 'Strength' ? 4 : 2);
        rowData.push(`${slotsLeft}/${machine.type === 'Strength' ? 4 : 2}`);
      });

      tableData.push(rowData);
    }

    return { tableHead, widthArr, tableData };
  };

  const { tableHead, widthArr, tableData } = renderScheduleTable();

  const renderCell = (data, index) => (
    <View style={[styles.cell, (data === '0/4' || data === '0/2') && styles.redCell]}>
      <Text style={styles.text}>
        {data}
      </Text>
    </View>
  );

  const renderHeaderCell = (data, index) => (
    <View style={styles.headerCell}>
      {typeof data === 'string' ? (
        <Text style={styles.headerText}>{data}</Text>
      ) : (
        <Image source={data} style={styles.headerImage} />
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Schedule for {date}</Text>
          <ScrollView horizontal>
            <View>
              <Table borderStyle={{ borderWidth: 1, borderColor: '#E2E2E2' }}>
                <TableWrapper style={styles.header}>
                  {tableHead.map((cellData, index) => (
                    <Cell
                      key={index}
                      data={renderHeaderCell(cellData, index)}
                      width={widthArr[index]}
                    />
                  ))}
                </TableWrapper>
              </Table>
              <ScrollView style={styles.dataWrapper}>
                <Table borderStyle={{ borderWidth: 1, borderColor: '#E2E2E2' }}>
                  {tableData.map((rowData, index) => (
                    <TableWrapper key={index} style={styles.row}>
                      {rowData.map((cellData, cellIndex) => (
                        <Cell
                          key={cellIndex}
                          data={renderCell(cellData, cellIndex)}
                          width={widthArr[cellIndex]}
                        />
                      ))}
                    </TableWrapper>
                  ))}
                </Table>
              </ScrollView>
            </View>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalContent: {
    flex: 1,
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: '#343a40',
  },
  headerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerCell: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  headerImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
    color: '#343a40',
  },
  redCell: {
    backgroundColor: 'red',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  dataWrapper: {
    marginTop: -1,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderColor: '#E2E2E2',
  },
  evenRow: {
    backgroundColor: '#e9ecef',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#6c757d',
    borderRadius: 5,
    alignItems: 'center',
    margin: 5,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default ScheduleModal;

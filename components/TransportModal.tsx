
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TransportModal = ({ visible, onSelect }) => {
  const transportModes = [
    { label: 'À pied', icon: '🚶‍♂️', speed: 5 },
    { label: 'Voiture', icon: '🚗', speed: 40 },
    { label: 'Moto', icon: '🛵', speed: 30 },
    { label: 'Bus', icon: '🚌', speed: 20 },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Choisissez un moyen de transport</Text>
          {transportModes.map((mode, index) => (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => onSelect(mode)}
            >
              <Text style={styles.optionText}>{mode.icon} {mode.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  container: { margin: 20, padding: 20, backgroundColor: '#fff', borderRadius: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  option: { padding: 12, backgroundColor: '#eee', marginVertical: 6, borderRadius: 8 },
  optionText: { fontSize: 16 },
});

export default TransportModal;

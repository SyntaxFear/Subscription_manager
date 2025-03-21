import * as React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Text } from './nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme colors
const ORANGE_COLOR = '#FF8000';

interface CustomIntervalModalProps {
  visible: boolean;
  onClose: (display?: string) => void;
  onSave: (startDate: Date, endDate: Date) => void;
}

const CUSTOM_DAYS_KEY = '@Subs:customDays';

export function CustomIntervalModal({ visible, onClose, onSave }: CustomIntervalModalProps) {
  const { colors } = useColorScheme();
  const [days, setDays] = React.useState('30');

  // Theme colors override
  const themeColors = React.useMemo(
    () => ({
      ...colors,
      primary: ORANGE_COLOR,
    }),
    [colors]
  );

  // Load saved custom days if available
  React.useEffect(() => {
    const loadCustomDays = async () => {
      try {
        const savedDays = await AsyncStorage.getItem(CUSTOM_DAYS_KEY);
        if (savedDays) {
          setDays(savedDays);
        }
      } catch (error) {
        console.error('Failed to load custom days', error);
      }
    };

    if (visible) {
      loadCustomDays();
    }
  }, [visible]);

  const handleSave = async () => {
    try {
      // Ensure days is a valid number
      const daysNum = parseInt(days, 10);
      if (isNaN(daysNum) || daysNum <= 0) {
        // Default to 30 days if invalid
        setDays('30');
        await AsyncStorage.setItem(CUSTOM_DAYS_KEY, '30');
        const displayText = `30 days`;

        // Calculate dates for the onSave callback
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        onSave(startDate, endDate);
        onClose(displayText);
        return;
      }

      await AsyncStorage.setItem(CUSTOM_DAYS_KEY, daysNum.toString());

      // Calculate dates for the onSave callback
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysNum);

      // Display text
      const displayText = daysNum === 1 ? `1 day` : `${daysNum} days`;

      onSave(startDate, endDate);
      onClose(displayText);
    } catch (error) {
      console.error('Failed to save custom days', error);
    }
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '80%',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    inputContainer: {
      width: '100%',
      marginVertical: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    input: {
      flex: 1,
      fontSize: 18,
      color: colors.foreground,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.grey4,
      borderRadius: 8,
      backgroundColor: colors.background,
      textAlign: 'center',
    },
    daysLabel: {
      fontSize: 18,
      color: colors.foreground,
      marginLeft: 10,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 20,
    },
    button: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      minWidth: 100,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: 'transparent',
    },
    saveButton: {
      backgroundColor: themeColors.primary,
    },
    cancelText: {
      color: themeColors.primary,
    },
    saveText: {
      color: '#fff',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      color: themeColors.foreground,
    },
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => onClose()}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Custom Subscription Interval</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={days}
              onChangeText={setDays}
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={styles.daysLabel}>days</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => onClose()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

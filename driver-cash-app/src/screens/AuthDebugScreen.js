import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../services/authService';

export default function AuthDebugScreen({ navigation }) {
  const [authData, setAuthData] = useState({
    token: null,
    userData: null,
    hasToken: false,
    hasUserData: false,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = userDataString ? JSON.parse(userDataString) : null;

      setAuthData({
        token: token ? `${token.substring(0, 30)}...` : null,
        userData: userData,
        hasToken: !!token,
        hasUserData: !!userData,
      });
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleClearAuth = async () => {
    await logout();
    await checkAuthStatus();
  };

  const handleGoToLogin = () => {
    navigation.replace('Login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🔐 Authentication Status</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Has Token:</Text>
          <Text style={[styles.value, authData.hasToken ? styles.success : styles.error]}>
            {authData.hasToken ? '✅ YES' : '❌ NO'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Token Preview:</Text>
          <Text style={styles.value}>{authData.token || 'No token stored'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Has User Data:</Text>
          <Text style={[styles.value, authData.hasUserData ? styles.success : styles.error]}>
            {authData.hasUserData ? '✅ YES' : '❌ NO'}
          </Text>
        </View>

        {authData.userData && (
          <View style={styles.section}>
            <Text style={styles.label}>User Info:</Text>
            <Text style={styles.value}>Name: {authData.userData.name}</Text>
            <Text style={styles.value}>Phone: {authData.userData.phone}</Text>
            <Text style={styles.value}>Role: {authData.userData.role}</Text>
            <Text style={styles.value}>ID: {authData.userData._id}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.refreshButton} onPress={checkAuthStatus}>
            <Text style={styles.buttonText}>🔄 Refresh Status</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton} onPress={handleClearAuth}>
            <Text style={styles.buttonText}>🗑️ Clear Auth Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleGoToLogin}>
            <Text style={styles.buttonText}>🔑 Go to Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Troubleshooting</Text>
          <Text style={styles.infoText}>
            If you're seeing 401 errors:
          </Text>
          <Text style={styles.infoText}>
            1. Check if "Has Token" shows ❌ NO
          </Text>
          <Text style={styles.infoText}>
            2. If NO, click "Go to Login" and login again
          </Text>
          <Text style={styles.infoText}>
            3. If YES but still errors, the token might be expired
          </Text>
          <Text style={styles.infoText}>
            4. Click "Clear Auth Data" then login again
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  success: {
    color: '#16A34A',
    fontWeight: 'bold',
  },
  error: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  refreshButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    marginTop: 24,
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1E3A8A',
    marginBottom: 8,
    lineHeight: 20,
  },
});

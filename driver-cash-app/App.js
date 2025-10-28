import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CashCollectionScreen from './src/screens/CashCollectionScreen';
import CollectionHistoryScreen from './src/screens/CollectionHistoryScreen';
import CollectionDetailsScreen from './src/screens/CollectionDetailsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#111827',
          headerTitleStyle: {
            fontWeight: '700',
            fontFamily: 'Inter'
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            headerLeft: null,
            title: 'Mahavir ERP - Driver'
          }}
        />
        <Stack.Screen 
          name="CashCollection" 
          component={CashCollectionScreen}
          options={{ title: 'Submit Cash Collection' }}
        />
        <Stack.Screen 
          name="CollectionHistory" 
          component={CollectionHistoryScreen}
          options={{ title: 'Collection History' }}
        />
        <Stack.Screen 
          name="CollectionDetails" 
          component={CollectionDetailsScreen}
          options={{ title: 'Collection Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

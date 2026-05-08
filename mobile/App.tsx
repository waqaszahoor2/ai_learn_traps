
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ProcessBookScreen from './src/screens/ProcessBookScreen';
import ChaptersScreen from './src/screens/ChaptersScreen';
import ExamScreen from './src/screens/ExamScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ProcessBook" component={ProcessBookScreen} options={{ title: "Upload Textbooks" }} />
          <Stack.Screen name="Chapters" component={ChaptersScreen} />
          <Stack.Screen name="Exam" component={ExamScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

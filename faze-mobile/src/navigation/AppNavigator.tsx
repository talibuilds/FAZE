import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import AuthScreen from '../screens/AuthScreen';
import UploadScreen from '../screens/UploadScreen';
import DetailScreen from '../screens/DetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import MainTabNavigator from './MainTabNavigator';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Upload: undefined;
  Detail: { mediaId: string };
  EditProfile: undefined;
  PrivacyPolicy: undefined;
  Feedback: undefined;
  ContactUs: undefined;
  TransactionHistory: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const token = useAuthStore((state) => state.token);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
        {token == null ? (
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="Upload" component={UploadScreen} />
            <Stack.Screen name="Detail" component={DetailScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} />
            <Stack.Screen name="ContactUs" component={ContactUsScreen} />
            <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

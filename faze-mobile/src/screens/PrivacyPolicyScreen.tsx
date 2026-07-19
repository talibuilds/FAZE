import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: July 2026</Text>
        
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.text}>
          Welcome to FAZE. We are committed to protecting your personal information and your right to privacy. When you use our application, you trust us with your personal information. We take your privacy very seriously.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.text}>
          We collect personal information that you voluntarily provide to us when you register on the app, express an interest in obtaining information about us or our products and services, or otherwise when you contact us.{'\n\n'}
          Personal information may include:{'\n'}
          • Name and email address{'\n'}
          • Account credentials{'\n'}
          • Transaction and purchase history{'\n'}
          • Content you upload to the platform
        </Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.text}>
          We use personal information collected via our app for a variety of business purposes including:{'\n\n'}
          • To facilitate account creation and login{'\n'}
          • To manage user accounts and provide customer support{'\n'}
          • To process transactions and send related information{'\n'}
          • To protect our services and maintain security
        </Text>

        <Text style={styles.sectionTitle}>4. Information Sharing</Text>
        <Text style={styles.text}>
          We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We do not sell your personal data to third parties.
        </Text>

        <Text style={styles.sectionTitle}>5. Data Security</Text>
        <Text style={styles.text}>
          We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
        </Text>

        <Text style={styles.sectionTitle}>6. Contact Us</Text>
        <Text style={styles.text}>
          If you have questions or comments about this policy, you may email us at privacy@faze.app or contact us through the Contact Us section in the app.
        </Text>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: { paddingHorizontal: 20 },
  lastUpdated: { color: '#D4AF37', fontSize: 13, marginBottom: 25, fontWeight: '600' },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  text: { color: '#AAA', fontSize: 15, lineHeight: 24, marginBottom: 10 },
});

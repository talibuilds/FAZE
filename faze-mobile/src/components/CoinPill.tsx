import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  balance: number | null | undefined;
}

export default function CoinPill({ balance }: Props) {
  return (
    <View style={styles.pill}>
      <View style={styles.dot} />
      <Text style={styles.text}>{balance ?? '...'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37', // Gold color
    marginRight: 6,
  },
  text: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

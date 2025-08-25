import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function PortfolioScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Portfolio Showcase</Text>
        <Text style={styles.subtitle}>Discover amazing architectural projects</Text>
        <Text style={styles.comingSoon}>Coming Soon...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 40,
  },
  comingSoon: {
    fontSize: 18,
    color: '#3498db',
    fontWeight: '600',
  },
});
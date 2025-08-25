import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useAuthStore } from '@/src/stores/authStore';
import { useAppStore } from '@/src/stores/appStore';
import { router } from 'expo-router';
import { initializeSampleData } from '@/src/utils/sampleData';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { featuredJobs, fetchFeaturedJobs } = useAppStore();

  useEffect(() => {
    const loadData = async () => {
      // Initialize sample data (only runs once per user)
      await initializeSampleData();
      // Fetch featured jobs
      fetchFeaturedJobs();
    };
    
    loadData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleSpecificContent = () => {
    if (user?.role === 'firm') {
      return (
        <View style={styles.ctaSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/post-job')}
          >
            <Text style={styles.buttonText}>Post a Job (₹499)</Text>
          </TouchableOpacity>
          <Text style={styles.ctaSubtext}>Find talented architects for your projects</Text>
        </View>
      );
    }

    return (
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/jobs')}
        >
          <Text style={styles.actionButtonText}>Find Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Upload Project</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {user?.profile.name}!
            </Text>
            <Text style={styles.subtitle}>
              {user?.role === 'firm' ? 'Manage your team' : 'Discover opportunities'}
            </Text>
          </View>
          <View style={styles.profileIcon}>
            <Text style={styles.profileInitial}>
              {user?.profile.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Role-specific CTA */}
        {getRoleSpecificContent()}

        {/* Featured Jobs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Jobs</Text>
            <TouchableOpacity onPress={() => router.push('/jobs')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {featuredJobs.length > 0 ? (
            featuredJobs.slice(0, 3).map((job) => (
              <TouchableOpacity key={job.id} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobCompany}>{job.company}</Text>
                </View>
                <View style={styles.jobDetails}>
                  <Text style={styles.jobLocation}>{job.location}</Text>
                  <Text style={styles.jobType}>{job.type}</Text>
                </View>
                {job.salary && (
                  <Text style={styles.jobSalary}>₹{job.salary.toLocaleString()}</Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No featured jobs available</Text>
              <Text style={styles.emptyStateSubtext}>Check back later for new opportunities</Text>
            </View>
          )}
        </View>

        {/* Trending Portfolios Section */}
        {user?.role !== 'firm' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Portfolios</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.portfolioStrip}>
                {[1, 2, 3, 4].map((item) => (
                  <TouchableOpacity key={item} style={styles.portfolioCard}>
                    <View style={styles.portfolioImage}>
                      <Text style={styles.portfolioPlaceholder}>Project {item}</Text>
                    </View>
                    <Text style={styles.portfolioAuthor}>Architect Name</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 4,
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  ctaSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 1,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ctaSubtext: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    marginTop: 1,
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 12,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  seeAllText: {
    color: '#3498db',
    fontSize: 16,
  },
  jobCard: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  jobHeader: {
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  jobCompany: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 2,
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  jobLocation: {
    fontSize: 14,
    color: '#95a5a6',
  },
  jobType: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  jobSalary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
  portfolioStrip: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  portfolioCard: {
    marginRight: 16,
    width: 120,
  },
  portfolioImage: {
    width: 120,
    height: 80,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  portfolioPlaceholder: {
    color: '#95a5a6',
    fontSize: 12,
  },
  portfolioAuthor: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

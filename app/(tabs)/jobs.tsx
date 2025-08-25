import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAppStore } from '@/src/stores/appStore';
import { useAuthStore } from '@/src/stores/authStore';
import { JobType } from '@/src/types';
import { applyToJob } from '@/src/services/jobs';
import { router } from 'expo-router';

const JOB_TYPES = [
  { label: 'All', value: null },
  { label: 'Internship', value: 'internship' },
  { label: 'Freelance', value: 'freelance' },
  { label: 'Full-time', value: 'fulltime' },
];

export default function JobsScreen() {
  const { jobs, loading, jobFilters, fetchJobs, setJobFilters } = useAppStore();
  const { user } = useAuthStore();
  
  const [searchText, setSearchText] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<(JobType | null)[]>([null]);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = () => {
    const filters = {
      ...jobFilters,
      search: searchText.trim() || undefined,
      type: selectedTypes.filter(type => type !== null) as JobType[],
    };
    
    setJobFilters(filters);
    fetchJobs();
  };

  const handleTypeFilter = (type: JobType | null) => {
    if (type === null) {
      setSelectedTypes([null]);
    } else {
      const newTypes = selectedTypes.includes(null) ? [type] : 
        selectedTypes.includes(type) ? 
          selectedTypes.filter(t => t !== type) :
          [...selectedTypes.filter(t => t !== null), type];
      
      setSelectedTypes(newTypes.length === 0 ? [null] : newTypes);
    }
  };

  const handleApply = async (jobId: string, jobTitle: string) => {
    try {
      setApplying(jobId);
      await applyToJob(jobId);
      
      Alert.alert(
        'Application Sent!', 
        `Your application for "${jobTitle}" has been submitted successfully.`,
        [{ text: 'OK' }]
      );
      
      // Refresh jobs to get updated application count
      fetchJobs();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit application');
    } finally {
      setApplying(null);
    }
  };

  const formatSalary = (salary?: number, stipend?: number) => {
    if (salary) return `₹${(salary / 100000).toFixed(1)}L`;
    if (stipend) return `₹${stipend.toLocaleString()}`;
    return 'Not specified';
  };

  const getJobTypeColor = (type: JobType) => {
    switch (type) {
      case 'internship': return '#f39c12';
      case 'freelance': return '#27ae60';
      case 'fulltime': return '#3498db';
      default: return '#7f8c8d';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jobs & Projects</Text>
        <Text style={styles.headerSubtitle}>Find your next opportunity</Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersSection}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs, companies..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFilters}>
          {JOB_TYPES.map((type) => (
            <TouchableOpacity
              key={type.label}
              style={[
                styles.typeFilter,
                selectedTypes.includes(type.value) && styles.typeFilterSelected,
              ]}
              onPress={() => handleTypeFilter(type.value)}
            >
              <Text
                style={[
                  styles.typeFilterText,
                  selectedTypes.includes(type.value) && styles.typeFilterTextSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Jobs List */}
      <ScrollView style={styles.jobsList} refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchJobs} />
      }>
        {loading && jobs.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Loading jobs...</Text>
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your filters or check back later
            </Text>
          </View>
        ) : (
          jobs.map((job) => (
            <View key={job.id} style={styles.jobCard}>
              {job.featured && (
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredText}>Featured</Text>
                </View>
              )}
              
              <View style={styles.jobHeader}>
                <View style={styles.jobTitleContainer}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobCompany}>{job.company}</Text>
                </View>
                <View style={[styles.jobType, { backgroundColor: getJobTypeColor(job.type) }]}>
                  <Text style={styles.jobTypeText}>
                    {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.jobDetails}>
                <Text style={styles.jobLocation}>
                  📍 {job.location} {job.remote && '(Remote)'}
                </Text>
                <Text style={styles.jobSalary}>
                  💰 {formatSalary(job.salary, job.stipend)}
                </Text>
              </View>

              <Text style={styles.jobDescription} numberOfLines={3}>
                {job.description}
              </Text>

              <View style={styles.jobFooter}>
                <Text style={styles.applicationsCount}>
                  {job.applications} applications
                </Text>
                
                {user?.role !== 'firm' && (
                  <TouchableOpacity
                    style={[styles.applyButton, applying === job.id && styles.applyButtonDisabled]}
                    onPress={() => handleApply(job.id, job.title)}
                    disabled={applying === job.id}
                  >
                    {applying === job.id ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.applyButtonText}>Apply Now</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button for Firms */}
      {user?.role === 'firm' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/post-job')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 4,
  },
  filtersSection: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    backgroundColor: '#f8f9fa',
  },
  searchButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  typeFilters: {
    flexDirection: 'row',
  },
  typeFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginRight: 12,
    backgroundColor: 'white',
  },
  typeFilterSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  typeFilterText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: '500',
  },
  typeFilterTextSelected: {
    color: 'white',
  },
  jobsList: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    color: '#7f8c8d',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featuredText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  jobType: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  jobTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  jobLocation: {
    fontSize: 14,
    color: '#95a5a6',
  },
  jobSalary: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  jobDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 16,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationsCount: {
    fontSize: 12,
    color: '#95a5a6',
  },
  applyButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  applyButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
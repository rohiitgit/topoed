import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { createJob } from '@/src/services/jobs';
import { createJobPostingPayment } from '@/src/services/payment';
import { createJobPostingPaymentDemo } from '@/src/services/paymentDemo';
import { JobType } from '@/src/types';

const JOB_TYPES: { label: string; value: JobType }[] = [
  { label: 'Internship', value: 'internship' },
  { label: 'Freelance', value: 'freelance' },
  { label: 'Full-time', value: 'fulltime' },
];

export default function PostJobScreen() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    type: 'fulltime' as JobType,
    location: '',
    remote: false,
    salary: '',
    stipend: '',
    description: '',
    requirements: '',
    featured: true, // Default to featured since they're paying ₹499
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ['title', 'company', 'location', 'description'];
    
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        Alert.alert('Missing Information', `Please fill in the ${field} field`);
        return false;
      }
    }

    if (formData.type === 'fulltime' && !formData.salary) {
      Alert.alert('Missing Information', 'Please specify salary for full-time positions');
      return false;
    }

    if ((formData.type === 'internship' || formData.type === 'freelance') && !formData.stipend) {
      Alert.alert('Missing Information', `Please specify stipend for ${formData.type} positions`);
      return false;
    }

    return true;
  };

  const handlePaymentAndPost = async () => {
    if (!validateForm()) return;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to post jobs');
      return;
    }

    try {
      setPaymentLoading(true);

      // Initiate payment (using demo for now - replace with createJobPostingPayment for production)
      console.log('Starting payment process...');
      const paymentResult = await createJobPostingPaymentDemo(
        {
          email: user.email,
          name: user.profile.name,
        },
        formData.title
      );

      console.log('Payment successful:', paymentResult);

      // Payment successful, now create the job
      setLoading(true);
      
      const jobData = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        type: formData.type,
        location: formData.location.trim(),
        remote: formData.remote,
        salary: formData.salary ? parseInt(formData.salary) : undefined,
        stipend: formData.stipend ? parseInt(formData.stipend) : undefined,
        description: formData.description.trim(),
        requirements: formData.requirements
          .split('\n')
          .map(req => req.trim())
          .filter(req => req.length > 0),
        featured: formData.featured,
      };

      console.log('Creating job with data:', jobData);
      const jobId = await createJob(jobData);

      Alert.alert(
        'Success!',
        'Your job has been posted successfully and is now featured on the platform!',
        [
          {
            text: 'View Jobs',
            onPress: () => router.replace('/(tabs)/jobs'),
          },
        ]
      );

    } catch (error: any) {
      console.error('Error in payment/posting process:', error);
      
      if (error.code === 'payment_cancelled') {
        Alert.alert('Payment Cancelled', 'Job posting was cancelled');
      } else if (error.code === 'payment_failed') {
        Alert.alert('Payment Failed', 'There was an issue with your payment. Please try again.');
      } else {
        Alert.alert(
          'Error',
          error.message || 'Failed to post job. Please try again.'
        );
      }
    } finally {
      setLoading(false);
      setPaymentLoading(false);
    }
  };

  if (user?.role !== 'firm') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>Only firms can post jobs</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post a Job</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Pricing Info */}
        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Featured Job Posting</Text>
          <Text style={styles.pricingAmount}>₹499</Text>
          <Text style={styles.pricingDescription}>
            • Featured badge on your job listing{'\n'}
            • Priority placement in search results{'\n'}
            • Highlighted on the home dashboard{'\n'}
            • Increased visibility to candidates
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Job Details</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Job Title *"
              value={formData.title}
              onChangeText={(text) => updateFormData('title', text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Company Name *"
              value={formData.company}
              onChangeText={(text) => updateFormData('company', text)}
            />

            <Text style={styles.inputLabel}>Job Type *</Text>
            <View style={styles.typeSelector}>
              {JOB_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    formData.type === type.value && styles.typeOptionSelected,
                  ]}
                  onPress={() => updateFormData('type', type.value)}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      formData.type === type.value && styles.typeOptionTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Location *"
              value={formData.location}
              onChangeText={(text) => updateFormData('location', text)}
            />

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Remote Work Available</Text>
              <Switch
                value={formData.remote}
                onValueChange={(value) => updateFormData('remote', value)}
                trackColor={{ false: '#e1e8ed', true: '#3498db' }}
                thumbColor={formData.remote ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            {formData.type === 'fulltime' ? (
              <TextInput
                style={styles.input}
                placeholder="Annual Salary (₹) *"
                keyboardType="numeric"
                value={formData.salary}
                onChangeText={(text) => updateFormData('salary', text)}
              />
            ) : (
              <TextInput
                style={styles.input}
                placeholder={`${formData.type === 'internship' ? 'Monthly Stipend' : 'Project Budget'} (₹) *`}
                keyboardType="numeric"
                value={formData.stipend}
                onChangeText={(text) => updateFormData('stipend', text)}
              />
            )}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Job Description</Text>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the role, responsibilities, and what you're looking for... *"
              multiline
              numberOfLines={6}
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Requirements (one per line)&#10;e.g.&#10;AutoCAD proficiency&#10;2+ years experience&#10;Architecture degree"
              multiline
              numberOfLines={4}
              value={formData.requirements}
              onChangeText={(text) => updateFormData('requirements', text)}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.postButton,
              (loading || paymentLoading) && styles.postButtonDisabled,
            ]}
            onPress={handlePaymentAndPost}
            disabled={loading || paymentLoading}
          >
            {paymentLoading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.postButtonText}>Processing Payment...</Text>
              </View>
            ) : loading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.postButtonText}>Posting Job...</Text>
              </View>
            ) : (
              <Text style={styles.postButtonText}>Pay ₹499 & Post Job</Text>
            )}
          </TouchableOpacity>
        </View>
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
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  backText: {
    color: '#3498db',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  pricingCard: {
    backgroundColor: '#e74c3c',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  pricingTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pricingAmount: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  pricingDescription: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  typeOptionSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  typeOptionTextSelected: {
    color: 'white',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  postButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
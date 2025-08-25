// Demo payment service for testing without Razorpay setup
import { Alert } from 'react-native';

export const createJobPostingPaymentDemo = (
  userDetails: { email: string; name: string; contact?: string },
  jobTitle: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    console.log('Demo payment initiated for:', { userDetails, jobTitle });
    
    // Show demo payment confirmation
    Alert.alert(
      'Demo Payment',
      `This is a demo payment for ₹499\n\nJob: ${jobTitle}\nUser: ${userDetails.name}\n\nIn production, this would integrate with Razorpay.`,
      [
        {
          text: 'Cancel Payment',
          style: 'cancel',
          onPress: () => reject({ code: 'payment_cancelled' }),
        },
        {
          text: 'Simulate Success',
          onPress: () => {
            console.log('Demo payment successful');
            resolve({
              razorpay_payment_id: 'demo_payment_' + Date.now(),
              razorpay_order_id: 'demo_order_' + Date.now(),
              razorpay_signature: 'demo_signature',
            });
          },
        },
        {
          text: 'Simulate Failure',
          onPress: () => reject({ code: 'payment_failed', message: 'Demo payment failed' }),
        },
      ]
    );
  });
};
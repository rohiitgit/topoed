import RazorpayCheckout from 'react-native-razorpay';

export interface PaymentDetails {
  amount: number; // in paise (₹499 = 49900 paise)
  currency: 'INR';
  name: string;
  description: string;
  orderId?: string;
}

export interface PaymentOptions {
  description: string;
  image?: string;
  currency: 'INR';
  key: string;
  amount: number;
  name: string;
  order_id?: string;
  prefill: {
    email: string;
    contact?: string;
    name: string;
  };
  theme: {
    color: string;
  };
}

export const initiatePayment = (
  paymentDetails: PaymentDetails,
  userDetails: { email: string; name: string; contact?: string }
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const options: PaymentOptions = {
      description: paymentDetails.description,
      image: 'https://i.imgur.com/3g7nmJC.png', // Your app logo URL
      currency: paymentDetails.currency,
      key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '',
      amount: paymentDetails.amount,
      name: paymentDetails.name,
      order_id: paymentDetails.orderId,
      prefill: {
        email: userDetails.email,
        contact: userDetails.contact || '',
        name: userDetails.name,
      },
      theme: { color: '#3498db' }
    };

    console.log('Initiating Razorpay payment with options:', options);

    RazorpayCheckout.open(options)
      .then((data: any) => {
        // Payment successful
        console.log('Payment successful:', data);
        resolve(data);
      })
      .catch((error: any) => {
        // Payment failed or cancelled
        console.log('Payment failed/cancelled:', error);
        reject(error);
      });
  });
};

// Standard job posting payment
export const JOB_POSTING_AMOUNT = 49900; // ₹499 in paise

export const createJobPostingPayment = (
  userDetails: { email: string; name: string; contact?: string },
  jobTitle: string
) => {
  return initiatePayment(
    {
      amount: JOB_POSTING_AMOUNT,
      currency: 'INR',
      name: 'Architects App - Job Posting',
      description: `Featured job posting: ${jobTitle}`,
    },
    userDetails
  );
};
interface RazorpayOptions {
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
}

interface RazorpayResponse {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  error?: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const initiateRazorpayPayment = (options: RazorpayOptions): Promise<RazorpayResponse> => {
  return new Promise((resolve, reject) => {
    // Check if Razorpay script is already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        createRazorpayInstance(options, resolve, reject);
      };
      script.onerror = () => {
        reject(new Error('Failed to load Razorpay checkout script'));
      };
      document.body.appendChild(script);
    } else {
      createRazorpayInstance(options, resolve, reject);
    }
  });
};

const createRazorpayInstance = (
  options: RazorpayOptions,
  resolve: (value: RazorpayResponse) => void,
  reject: (reason: Error) => void
) => {
  try {
    const razorpay = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: options.amount,
      currency: options.currency,
      name: options.name,
      description: options.description,
      prefill: {
        name: options.prefill.name,
        email: options.prefill.email,
        contact: options.prefill.contact,
      },
      handler: function (response: RazorpayResponse) {
        resolve(response);
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment cancelled by user'));
        },
      },
      theme: {
        color: '#3B82F6',
      },
    });

    razorpay.open();
  } catch (error) {
    reject(error instanceof Error ? error : new Error('Unknown error occurred'));
  }
};

export const verifyRazorpayPayment = async (
  paymentId: string,
  orderId: string,
  signature: string,
  amount: number,
  currency: string
): Promise<boolean> => {
  try {
    // Verify the payment on the server
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
        amount,
        currency
      }),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};

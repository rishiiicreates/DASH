# DASHMATRICES - Social Media Dashboard

A comprehensive social media dashboard that integrates multiple platforms (YouTube, Instagram, Twitter, Facebook) with Firebase authentication and Razorpay subscriptions.

## Features

- **Unified Dashboard**: View analytics from multiple social media platforms in one place
- **Authentication**: Secure login through Firebase (email/password, Google, GitHub)
- **API Connections**: Connect your social media accounts using platform-specific API keys
- **Subscription Plans**: Access extended analytics with premium plans via Razorpay payments
- **Responsive Design**: Modern UI that works on desktop, tablet, and mobile devices

## Setup

### Prerequisites

- Node.js (>= 14.x)
- npm or yarn

### Environment Variables

Create a `.env` file in the root directory using the provided `.env.example` as a template:

```
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Replace the placeholder values with your actual API keys from:
- [Firebase Console](https://console.firebase.google.com/)
- [Razorpay Dashboard](https://dashboard.razorpay.com/)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/rishiiicreates/DASHMATRICES.git
   cd DASHMATRICES
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to: `http://localhost:5000`

## Connecting Social Media Platforms

To connect your social media accounts, you'll need to:

1. Create developer accounts on each platform:
   - [YouTube/Google](https://console.developers.google.com/)
   - [Instagram/Facebook](https://developers.facebook.com/)
   - [Twitter](https://developer.twitter.com/)
   - [Facebook](https://developers.facebook.com/)

2. Obtain API keys for each platform

3. Add your API keys in the Settings page of the dashboard

## License

MIT
import SeoLandingPage from '@/components/SeoLandingPage';

export default function HowItWorksPage() {
  return (
    <SeoLandingPage
      path="/how-it-works"
      title="How Skopyr Works"
      description="Learn how Skopyr helps Abuja customers post service requests, compare real provider bids, message directly, and pay safely through escrow."
      eyebrow="How It Works"
      heading="Post once. Compare bids. Hire with confidence."
      intro="Skopyr is a reverse marketplace for services in Abuja. Customers post what they need, verified providers compete with real bids, and payments stay protected through escrow until the work is complete."
      primaryCta={{ href: '/', label: 'Open Skopyr' }}
      secondaryCta={{ href: '/for-customers', label: 'See buyer flow' }}
      sections={[
        {
          title: '1. Post a request',
          body: 'Describe the job, add your budget range, location, and urgency, then publish it. Your request becomes visible to providers who work in that category.',
          bullets: ['Request posting is free', 'Each request stays saved in your profile', 'Providers can message you directly from the request'],
        },
        {
          title: '2. Receive real provider bids',
          body: 'Providers send actual quotes with price, arrival time, and a buyer-facing note. You can compare multiple bids side by side and message providers before accepting anyone.',
          bullets: ['Bids are linked to your request', 'You can review provider rating and jobs completed', 'Message threads stay inside the app'],
        },
        {
          title: '3. Pay through escrow',
          body: 'When you accept a provider, you pay through Paystack and Skopyr creates an escrow record. That keeps the payment protected while the job is underway.',
          bullets: ['Protected payment flow', 'Provider earnings update after verification', 'Both buyer and provider dashboards reflect payment status'],
        },
      ]}
    />
  );
}

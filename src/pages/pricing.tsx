import SeoLandingPage from '@/components/SeoLandingPage';

export default function PricingPage() {
  return (
    <SeoLandingPage
      path="/pricing"
      title="Skopyr Pricing"
      description="Skopyr pricing for Abuja customers and providers, including free request posting, protected payments, and sponsored ad plans capped at NGN 15,000 per month."
      eyebrow="Pricing"
      heading="Simple pricing for requests, protected payments, and provider promotion."
      intro="Customers can post service requests for free. Providers can choose whether to promote their services with sponsored ads, and accepted jobs move through protected checkout."
      primaryCta={{ href: '/', label: 'Open Skopyr' }}
      secondaryCta={{ href: '/for-providers', label: 'For providers' }}
      sections={[
        {
          title: 'Post requests for free',
          body: 'Customers do not pay to post a request on Skopyr. You only pay when you accept a provider and move into the protected checkout flow.',
          bullets: ['Free request posting', 'Free bid comparison', 'Message providers before paying'],
        },
        {
          title: 'Sponsored ad plans',
          body: 'Provider ad plans are now capped at NGN 15,000 for the full monthly option, with lower plans for shorter visibility windows.',
          bullets: ['Starter Week: NGN 5,000', 'Spotlight 14 Days: NGN 9,000', 'Citywide 30 Days: NGN 15,000'],
        },
        {
          title: 'Protected payment flow',
          body: 'Accepted jobs move into a Paystack checkout that powers escrow and provider earnings tracking in the app.',
          bullets: ['Buyer payment protection', 'Escrow visibility', 'Provider earnings records after verification'],
        },
      ]}
    />
  );
}

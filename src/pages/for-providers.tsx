import SeoLandingPage from '@/components/SeoLandingPage';

export default function ForProvidersPage() {
  return (
    <SeoLandingPage
      path="/for-providers"
      title="Skopyr for Providers"
      description="Skopyr helps service providers in Abuja find open jobs, submit bids, message customers, run sponsored ads, and track earnings."
      eyebrow="For Providers"
      heading="Win better jobs, run sponsored ads, and track your earnings."
      intro="Providers use Skopyr to browse live requests, send real quotes, manage messages, promote their services, and follow earnings after verified payments."
      primaryCta={{ href: '/', label: 'Browse live requests' }}
      secondaryCta={{ href: '/pricing', label: 'View pricing' }}
      sections={[
        {
          title: 'Send real provider bids',
          body: 'Each bid includes your price, arrival time, and service message. Buyers can compare your quote, message you, and accept it through the app.',
          bullets: ['One bid per request from each provider profile', 'Edit bids before acceptance', 'Track active bids in your dashboard'],
        },
        {
          title: 'Run sponsored ads',
          body: 'Sponsored ad plans help providers appear more prominently on the homepage and in premium surfaces, which can increase buyer messages.',
          bullets: ['Starter, spotlight, and monthly plans', 'Pay through Paystack', 'Campaigns go live after payment verification'],
        },
        {
          title: 'Track money after checkout',
          body: 'When a buyer accepts your bid and pays, Skopyr creates escrow and earnings records so you can follow pending and available balances from your provider profile.',
          bullets: ['Protected payment records', 'Pending vs available balance', 'Visible payout history'],
        },
      ]}
    />
  );
}

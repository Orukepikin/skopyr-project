import SeoLandingPage from '@/components/SeoLandingPage';

export default function ForCustomersPage() {
  return (
    <SeoLandingPage
      path="/for-customers"
      title="Skopyr for Customers"
      description="Skopyr helps customers in Abuja post jobs, compare provider bids, message directly, and track escrow payments from one profile."
      eyebrow="For Customers"
      heading="Find better providers without chasing quotes yourself."
      intro="Skopyr is built for people who need fast, trusted help for generator repair, plumbing, cleaning, solar, AC repair, and more in Abuja."
      primaryCta={{ href: '/', label: 'Post a request' }}
      secondaryCta={{ href: '/faq', label: 'Read FAQs' }}
      sections={[
        {
          title: 'One request, many bids',
          body: 'Instead of calling around for prices, you publish one request and let providers compete with real quotes, timelines, and service notes.',
          bullets: ['Compare real provider bids', 'Review prices side by side', 'See which providers respond fastest'],
        },
        {
          title: 'Messaging in one place',
          body: 'Every provider conversation stays in your customer inbox, which makes it easier to clarify details before you book the job.',
          bullets: ['Ask questions before paying', 'Track unread threads', 'Return to old conversations later'],
        },
        {
          title: 'Protected checkout',
          body: 'Accepted bids move into a protected Paystack payment flow and create an escrow record so you can track the transaction through completion.',
          bullets: ['Escrow-style protection', 'Payment timeline visibility', 'Dashboard tracking for each protected job'],
        },
      ]}
    />
  );
}

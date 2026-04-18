import SeoLandingPage from '@/components/SeoLandingPage';

const faqs = [
  {
    question: 'How does Skopyr work?',
    answer:
      'Customers post service requests, providers send real bids, both sides can message each other, and accepted jobs move into a protected Paystack payment flow with escrow tracking.',
  },
  {
    question: 'Can providers message buyers directly?',
    answer:
      'Yes. Providers can message buyers from open requests and from their dashboard inbox, while buyers can message providers from bids and sponsored service placements.',
  },
  {
    question: 'How much do sponsored ads cost on Skopyr?',
    answer:
      'Sponsored ad plans currently start at NGN 5,000 for one week, NGN 9,000 for 14 days, and NGN 15,000 for the monthly citywide plan.',
  },
  {
    question: 'How are payments protected?',
    answer:
      'Accepted bids use Paystack checkout. After verification, Skopyr creates an escrow record for the buyer and a matching earnings record for the provider dashboard.',
  },
];

export default function FaqPage() {
  return (
    <SeoLandingPage
      path="/faq"
      title="Skopyr FAQ"
      description="Answers to common questions about Skopyr, including provider bids, buyer messaging, protected payments, and sponsored ads."
      eyebrow="FAQ"
      heading="Answers about bidding, messaging, ads, and protected payments."
      intro="These are the common questions people ask before using Skopyr in Abuja."
      primaryCta={{ href: '/', label: 'Try Skopyr' }}
      secondaryCta={{ href: '/how-it-works', label: 'How it works' }}
      sections={[
        {
          title: 'Why this page matters for search',
          body: 'FAQ pages give Google clearer crawlable content around common user questions, which helps Search understand what the site does and who it serves.',
          bullets: ['Clear question-and-answer content', 'Structured data support', 'Internal links back into the main product'],
        },
      ]}
      faqs={faqs}
    />
  );
}

interface Section {
  title: string;
  body: string;
  bullets?: string[];
}

interface FaqItem {
  question: string;
  answer: string;
}

interface CtaLink {
  href: string;
  label: string;
}

export interface SeoServicePage {
  slug: string;
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  cardTitle: string;
  cardBody: string;
  sections: Section[];
  faqs: FaqItem[];
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
}

export const seoServicePages: SeoServicePage[] = [
  {
    slug: 'generator-repair-abuja',
    path: '/generator-repair-abuja',
    title: 'Generator Repair in Abuja',
    description:
      'Find generator repair in Abuja with Skopyr. Post urgent power issues, compare verified provider bids, message technicians directly, and pay safely through escrow.',
    eyebrow: 'Generator Repair Abuja',
    heading: 'Generator repair in Abuja without chasing five different technicians.',
    intro:
      'Skopyr helps homes and businesses in Abuja post generator faults once, receive real repair bids from verified providers, and choose the best technician with payment protection built in.',
    cardTitle: 'Generator repair in Abuja',
    cardBody:
      'Post generator faults once and compare urgent repair bids from verified Abuja technicians.',
    primaryCta: { href: '/', label: 'Post a generator request' },
    secondaryCta: { href: '/for-customers', label: 'See customer flow' },
    sections: [
      {
        title: 'Get urgent quotes fast',
        body:
          'When power issues hit, customers can post generator jobs for Wuse, Gwarinpa, Lokogoma, Kubwa, and nearby Abuja districts without calling around first.',
        bullets: [
          'Request posting is free',
          'Providers reply with real price and arrival windows',
          'You can compare emergency and same-day options side by side',
        ],
      },
      {
        title: 'Message repair providers before hiring',
        body:
          'Ask whether the problem sounds like an alternator issue, starter fault, servicing need, or wiring problem before you accept a bid.',
        bullets: [
          'Clarify symptoms in one thread',
          'Keep photos, notes, and follow-up questions in the inbox',
          'See which repair providers respond fastest',
        ],
      },
      {
        title: 'Protect bigger repair jobs with escrow',
        body:
          'Once you accept a provider, Skopyr moves the job into Paystack-backed escrow so the payment status stays visible while the repair is in progress.',
        bullets: [
          'Protected payment tracking',
          'Customer and provider dashboards update automatically',
          'Useful for larger parts-and-labour jobs',
        ],
      },
    ],
    faqs: [
      {
        question: 'How do I find generator repair in Abuja on Skopyr?',
        answer:
          'Open Skopyr, post your generator issue with your location and budget, then compare incoming bids from verified Abuja providers.',
      },
      {
        question: 'Can I message a generator technician before I pay?',
        answer:
          'Yes. Buyers and providers can message inside the app before a booking or payment is confirmed.',
      },
      {
        question: 'Does Skopyr support protected payment for repair jobs?',
        answer:
          'Yes. Accepted jobs can move into a Paystack-backed escrow flow so payment status is visible through completion.',
      },
    ],
  },
  {
    slug: 'plumbers-in-abuja',
    path: '/plumbers-in-abuja',
    title: 'Plumbers in Abuja',
    description:
      'Find plumbers in Abuja through Skopyr. Post leaking pipe, bathroom, drainage, and installation jobs, compare bids, and hire with protected payment.',
    eyebrow: 'Plumbers Abuja',
    heading: 'Need plumbers in Abuja? Post once and let trusted providers compete.',
    intro:
      'Skopyr gives Abuja customers a cleaner way to hire plumbers for leak repairs, bathroom fittings, drainage work, and water installation jobs without hunting through scattered contacts.',
    cardTitle: 'Plumbers in Abuja',
    cardBody:
      'Compare plumbing quotes for leaks, drainage, fittings, and emergency water issues across Abuja.',
    primaryCta: { href: '/', label: 'Post a plumbing request' },
    secondaryCta: { href: '/pricing', label: 'See provider pricing' },
    sections: [
      {
        title: 'Post leaks, fittings, or drainage jobs',
        body:
          'Customers can create plumbing requests for homes, offices, short lets, and estates in Maitama, Lugbe, Asokoro, and other Abuja areas.',
        bullets: [
          'Leaking pipe and tap repairs',
          'Toilet, shower, and sink fittings',
          'Drainage and water line work',
        ],
      },
      {
        title: 'Compare real plumber bids',
        body:
          'Each provider sends an actual quote with timing and job notes, which makes it easier to compare workmanship and availability before you choose.',
        bullets: [
          'Review multiple plumbing quotes in one place',
          'See estimated arrival time before hiring',
          'Keep provider replies tied to the request record',
        ],
      },
      {
        title: 'Track the job from request to payout',
        body:
          'Accepted plumbing jobs flow into the same message, escrow, and earnings system that powers the wider Skopyr marketplace.',
        bullets: [
          'Customer dashboard tracks protected jobs',
          'Provider dashboard reflects earnings after verification',
          'Both sides keep a clear job history',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I find emergency plumbers in Abuja on Skopyr?',
        answer:
          'Yes. You can post urgent plumbing requests and receive responses from verified providers who work in Abuja.',
      },
      {
        question: 'Can providers bid on plumbing jobs directly?',
        answer:
          'Yes. Providers can submit first-class bids with their price, arrival time, and a note explaining their approach.',
      },
      {
        question: 'Can plumbing providers promote their services?',
        answer:
          'Yes. Providers can run paid sponsored ads to increase visibility for their plumbing services on Skopyr.',
      },
    ],
  },
  {
    slug: 'ac-repair-abuja',
    path: '/ac-repair-abuja',
    title: 'AC Repair in Abuja',
    description:
      'Book AC repair in Abuja through Skopyr. Compare bids for cooling faults, servicing, gas refill, and installation jobs from verified local providers.',
    eyebrow: 'AC Repair Abuja',
    heading: 'AC repair in Abuja with faster quotes and clearer provider communication.',
    intro:
      'From split-unit faults to servicing and gas refill jobs, Skopyr helps Abuja customers post AC requests once and compare provider bids without the usual back-and-forth.',
    cardTitle: 'AC repair in Abuja',
    cardBody:
      'Find technicians for AC servicing, cooling faults, gas refill, and installation work in Abuja.',
    primaryCta: { href: '/', label: 'Post an AC repair request' },
    secondaryCta: { href: '/how-it-works', label: 'Learn how bidding works' },
    sections: [
      {
        title: 'Handle urgent cooling issues quickly',
        body:
          'Customers can post AC faults for apartments, shops, and offices in Jabi, Wuye, Gudu, and central Abuja when cooling fails or water starts leaking.',
        bullets: [
          'Cooling problems and noisy units',
          'Gas refill and general servicing',
          'Installation and relocation jobs',
        ],
      },
      {
        title: 'Compare technician availability',
        body:
          'Instead of repeating the same explanation to multiple contacts, you collect AC repair bids in one place and review timing, pricing, and provider notes together.',
        bullets: [
          'Arrival time is attached to each bid',
          'Direct messaging reduces missed details',
          'Bids stay visible even after the chat continues',
        ],
      },
      {
        title: 'Keep customer and provider history organized',
        body:
          'Each accepted AC job stays tied to a request record, a conversation thread, and the protected payment state so both sides can track progress.',
        bullets: [
          'Jobs stay visible in the profile dashboard',
          'Protected jobs can be reviewed later',
          'Useful for repeat service and maintenance work',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I use Skopyr for AC servicing in Abuja?',
        answer:
          'Yes. AC servicing, gas refill, repairs, and installation jobs can all be posted through the same request flow.',
      },
      {
        question: 'Do providers message buyers directly on AC jobs?',
        answer:
          'Yes. Providers can message buyers from open jobs and continue the conversation inside the app inbox.',
      },
      {
        question: 'Can I compare more than one AC repair quote?',
        answer:
          'Yes. Skopyr is built so you can compare multiple real provider bids before choosing who to hire.',
      },
    ],
  },
  {
    slug: 'solar-inverter-repair-abuja',
    path: '/solar-inverter-repair-abuja',
    title: 'Solar and Inverter Repair in Abuja',
    description:
      'Find solar and inverter repair in Abuja through Skopyr. Post faults, compare verified provider bids, and manage protected payment for larger energy jobs.',
    eyebrow: 'Solar and Inverter Abuja',
    heading: 'Solar and inverter repair in Abuja with stronger trust signals built in.',
    intro:
      'Skopyr helps Abuja homes and small businesses hire solar and inverter technicians for diagnostics, battery issues, inverter faults, panel servicing, and upgrade work.',
    cardTitle: 'Solar and inverter repair',
    cardBody:
      'Compare local solar and inverter technicians for faults, diagnostics, battery issues, and system upgrades.',
    primaryCta: { href: '/', label: 'Post a solar request' },
    secondaryCta: { href: '/for-providers', label: 'See provider tools' },
    sections: [
      {
        title: 'Post diagnostic and upgrade jobs',
        body:
          'Solar and inverter requests often need more detail than a simple phone call. Skopyr lets customers write the symptoms, budget range, and urgency once.',
        bullets: [
          'Battery and charging problems',
          'Inverter fault diagnosis',
          'Panel maintenance and system expansion',
        ],
      },
      {
        title: 'Useful for higher-value energy work',
        body:
          'Because solar and inverter jobs can be larger-ticket than everyday repairs, customers benefit from clearer provider comparison and protected payment tracking.',
        bullets: [
          'Bid comparison before acceptance',
          'In-app conversation trail',
          'Escrow visibility for bigger jobs',
        ],
      },
      {
        title: 'Help strong providers stand out',
        body:
          'Solar providers can also use sponsored placement to make their services more discoverable on the homepage and in the broader Skopyr marketplace.',
        bullets: [
          'Sponsored visibility plans',
          'Provider profile and inbox tracking',
          'A clearer path from discovery to paid work',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I hire solar and inverter technicians in Abuja on Skopyr?',
        answer:
          'Yes. You can post solar and inverter repair or upgrade jobs and receive bids from providers working in Abuja.',
      },
      {
        question: 'Is Skopyr useful for larger inverter jobs?',
        answer:
          'Yes. The escrow-backed payment flow is especially helpful on larger jobs where customers want more protection and tracking.',
      },
      {
        question: 'Can solar providers advertise on Skopyr?',
        answer:
          'Yes. Paid sponsored ads let solar and inverter providers buy premium placement to attract more direct conversations.',
      },
    ],
  },
  {
    slug: 'electricians-in-abuja',
    path: '/electricians-in-abuja',
    title: 'Electricians in Abuja',
    description:
      'Hire electricians in Abuja with Skopyr. Post wiring, installation, fault-finding, and electrical maintenance jobs, then compare provider bids in one place.',
    eyebrow: 'Electricians Abuja',
    heading: 'Electricians in Abuja, with bids you can actually compare before hiring.',
    intro:
      'Skopyr helps Abuja customers find electricians for home, office, and site work by turning scattered enquiries into one structured request and a clean bid comparison flow.',
    cardTitle: 'Electricians in Abuja',
    cardBody:
      'Hire electricians for wiring, fittings, fault-finding, and electrical maintenance work across Abuja.',
    primaryCta: { href: '/', label: 'Post an electrical request' },
    secondaryCta: { href: '/faq', label: 'Read common questions' },
    sections: [
      {
        title: 'Use one request for many electrical jobs',
        body:
          'Customers can post electrical requests for wiring, fittings, troubleshooting, generator changeover work, and general maintenance without starting from scratch each time.',
        bullets: [
          'Residential and office jobs',
          'Small repairs or larger installations',
          'Location and urgency included in the request',
        ],
      },
      {
        title: 'Keep technical clarification inside the chat',
        body:
          'Electrical jobs often need follow-up questions. Skopyr keeps those conversations tied to the same request so the job details do not get lost.',
        bullets: [
          'Direct provider messaging',
          'Request details stay visible while you chat',
          'Cleaner handoff from quote to booking',
        ],
      },
      {
        title: 'Make serious providers easier to trust',
        body:
          'Verified profiles, completed-job stats, and protected payment status give customers more confidence than casual WhatsApp-only hiring.',
        bullets: [
          'Provider profile context',
          'Clear bid and payment history',
          'Better trust signals for first-time buyers',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I find electricians in Abuja for small home repairs?',
        answer:
          'Yes. Skopyr supports both quick household jobs and larger electrical requests for homes or businesses.',
      },
      {
        question: 'Do electricians bid directly on posted jobs?',
        answer:
          'Yes. Electricians can submit provider bids with their price, estimated timing, and a note for the buyer.',
      },
      {
        question: 'Can I track accepted electrical jobs after payment?',
        answer:
          'Yes. Accepted jobs remain visible in the app with their message history and protected payment status.',
      },
    ],
  },
  {
    slug: 'cleaners-in-abuja',
    path: '/cleaners-in-abuja',
    title: 'Cleaners in Abuja',
    description:
      'Find cleaners in Abuja with Skopyr. Post one-off or recurring cleaning jobs, compare provider bids, and message cleaning professionals directly before booking.',
    eyebrow: 'Cleaners Abuja',
    heading: 'Cleaners in Abuja, with a simpler path from search to booking.',
    intro:
      'Skopyr gives Abuja customers a cleaner way to hire home, office, move-in, and deep-cleaning providers while helping serious cleaners win more visible demand.',
    cardTitle: 'Cleaners in Abuja',
    cardBody:
      'Book home, office, deep-cleaning, and move-in cleaning services through clear bids and direct chat.',
    primaryCta: { href: '/', label: 'Post a cleaning request' },
    secondaryCta: { href: '/for-customers', label: 'See customer benefits' },
    sections: [
      {
        title: 'Post home or office cleaning jobs',
        body:
          'Customers can request regular cleaning, one-off deep cleaning, post-renovation cleanup, and move-in work from verified providers in Abuja.',
        bullets: [
          'Residential and office cleaning',
          'Recurring or one-time jobs',
          'Useful for apartments, shops, and short lets',
        ],
      },
      {
        title: 'Compare providers on more than price',
        body:
          'The best cleaning hire is not always the cheapest. Skopyr lets buyers compare timing, notes, and professionalism before accepting a bid.',
        bullets: [
          'Provider notes stay attached to the bid',
          'Message before you commit',
          'Choose based on fit, not guesswork',
        ],
      },
      {
        title: 'Help better cleaning providers get found',
        body:
          'Cleaning professionals can use sponsored placement to appear more prominently and turn marketplace visibility into premium conversations.',
        bullets: [
          'Paid sponsored visibility',
          'Inbox tracking for new leads',
          'A repeatable growth path for providers',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I book house cleaners in Abuja on Skopyr?',
        answer:
          'Yes. House cleaning, office cleaning, deep cleaning, and move-in cleaning requests can all be posted on Skopyr.',
      },
      {
        question: 'Can cleaners advertise their services on Skopyr?',
        answer:
          'Yes. Providers can pay for sponsored placement so their cleaning services become more visible to buyers.',
      },
      {
        question: 'Does Skopyr support direct buyer-provider messaging for cleaning jobs?',
        answer:
          'Yes. Buyers and providers can message each other directly inside the app before and after a bid is sent.',
      },
    ],
  },
];

export function getSeoServicePage(slug: string) {
  return seoServicePages.find((page) => page.slug === slug);
}

export function getRelatedSeoServiceLinks(slug: string, count = 3) {
  return seoServicePages
    .filter((page) => page.slug !== slug)
    .slice(0, count)
    .map((page) => ({
      href: page.path,
      label: page.title,
    }));
}

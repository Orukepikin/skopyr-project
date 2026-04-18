import type { GetServerSideProps } from 'next';

const siteUrl = 'https://www.skopyr.com';

function createSitemap() {
  const urls = [
    {
      loc: `${siteUrl}/`,
      changefreq: 'daily',
      priority: '1.0',
    },
    {
      loc: `${siteUrl}/how-it-works`,
      changefreq: 'weekly',
      priority: '0.9',
    },
    {
      loc: `${siteUrl}/for-customers`,
      changefreq: 'weekly',
      priority: '0.9',
    },
    {
      loc: `${siteUrl}/for-providers`,
      changefreq: 'weekly',
      priority: '0.9',
    },
    {
      loc: `${siteUrl}/pricing`,
      changefreq: 'weekly',
      priority: '0.8',
    },
    {
      loc: `${siteUrl}/faq`,
      changefreq: 'weekly',
      priority: '0.8',
    },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `<url>
  <loc>${url.loc}</loc>
  <changefreq>${url.changefreq}</changefreq>
  <priority>${url.priority}</priority>
</url>`
  )
  .join('\n')}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.write(createSitemap());
  res.end();

  return {
    props: {},
  };
};

export default function Sitemap() {
  return null;
}

import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';
import { getRelatedSeoServiceLinks, getSeoServicePage, seoServicePages } from '@/lib/seoServicePages';

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: seoServicePages.map((page) => ({
    params: { slug: page.slug },
  })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<{
  slug: string;
}> = async ({ params }) => {
  const slug = String(params?.slug ?? '');
  const page = getSeoServicePage(slug);

  if (!page) {
    return { notFound: true };
  }

  return {
    props: {
      slug,
    },
  };
};

export default function SeoServicePage({ slug }: InferGetStaticPropsType<typeof getStaticProps>) {
  const page = getSeoServicePage(slug);

  if (!page) {
    return null;
  }

  return (
    <SeoLandingPage
      path={page.path}
      title={page.title}
      description={page.description}
      eyebrow={page.eyebrow}
      heading={page.heading}
      intro={page.intro}
      sections={page.sections}
      faqs={page.faqs}
      primaryCta={page.primaryCta}
      secondaryCta={page.secondaryCta}
      relatedLinks={getRelatedSeoServiceLinks(slug)}
    />
  );
}

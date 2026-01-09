import type { Profile, Experience, Education, SocialLink } from '@in-midst-my-life/schema';
import { generatePersonJsonLd } from '@in-midst-my-life/content-model';

interface StructuredDataProps {
  profile: Profile;
  experiences?: Experience[];
  educations?: Education[];
  socialLinks?: SocialLink[];
}

export function StructuredData({
  profile,
  experiences,
  educations,
  socialLinks,
}: StructuredDataProps) {
  const jsonLd = generatePersonJsonLd(
    profile,
    { experiences, educations, socialLinks },
    { includeCV: true },
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

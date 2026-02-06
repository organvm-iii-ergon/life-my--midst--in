'use client';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

const features: Feature[] = [
  {
    title: 'Identity Masks',
    description:
      'Present different facets of your professional identity to different audiences. 15+ masks — Analyst, Strategist, Artisan, and more — each reshaping your profile.',
    icon: '🎭',
  },
  {
    title: 'Narrative Engine',
    description:
      'Transform raw CV data into compelling, context-aware narratives. LLM-powered agents generate stories aligned with your chosen mask and audience.',
    icon: '✍️',
  },
  {
    title: 'DID/VC Verification',
    description:
      'Anchor your credentials with decentralized identifiers and verifiable credentials. Prove your claims without relying on centralized authorities.',
    icon: '🔐',
  },
  {
    title: 'Hunter Protocol',
    description:
      'Automated job discovery, compatibility analysis, and batch applications. Your AI-powered job hunting agent works while you sleep.',
    icon: '🎯',
  },
  {
    title: 'Temporal Epochs',
    description:
      'Organize your career into meaningful chapters. Map experiences, projects, and skills across eras with rich timeline visualization.',
    icon: '⏳',
  },
  {
    title: 'Agent Orchestrator',
    description:
      'Six specialized LLM agents — Narrator, Reviewer, Architect, Tester, Implementer, Maintainer — collaborate through a task queue to manage your profile.',
    icon: '🤖',
  },
];

export function FeatureGrid() {
  return (
    <section
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '2rem clamp(1rem, 3vw, 2.5rem) 4rem',
      }}
    >
      <h2
        className="fade-up"
        style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
          textAlign: 'center',
          marginBottom: '2.5rem',
        }}
      >
        Everything your identity needs
      </h2>

      <div className="grid three stagger">
        {features.map((feature) => (
          <div className="section" key={feature.title}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>{feature.icon}</div>
            <h3
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: '1.15rem',
                margin: '0 0 0.5rem',
              }}
            >
              {feature.title}
            </h3>
            <p style={{ color: 'var(--stone)', fontSize: '0.9rem', margin: 0, lineHeight: 1.55 }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

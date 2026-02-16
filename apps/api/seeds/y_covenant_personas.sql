-- COVENANT Persona Entries (G3)
-- Seeds the 6 philosophical personas defined in COVENANT.md §III.A
-- into the identity_core table for the two demo profiles.
-- Uses ON CONFLICT DO NOTHING to avoid overwriting manual edits.

-- Profile 1 (Elena Vasquez) — Persona Mechanica emphasis
INSERT INTO identity_core (profile_id, thesis, invariants, master_keywords, intellectual_lineage, strategic_differentiators, tensions, constraints)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Systems architecture is an act of translation between human intention and machine capability — every design decision is a philosophical commitment.',
  '["Architectural clarity over clever abstraction", "Operational excellence as ethical obligation", "Technical decisions carry narrative weight", "Breadth of experience is qualification, not liability"]'::jsonb,
  '["distributed systems", "organizational design", "technical writing", "mentorship", "systems thinking"]'::jsonb,
  '["Persona Mechanica: builder, architect, infrastructure", "Persona Sapiens: analyst, researcher, truth-seeker", "Persona Synthesist: translator between engineering and organizational worlds"]'::jsonb,
  '["RFC authorship adopted org-wide", "40+ engineers mentored across levels", "Platform teams at three companies", "Boundary of systems thinking and organizational design"]'::jsonb,
  '["Depth vs breadth in specialization", "Engineering rigor vs human-centered flexibility", "Individual craft vs team leadership"]'::jsonb,
  '["Refuse to reduce humans to single dimensions", "Every mask must be authentic, not performed", "Complete qualification includes all dimensions of lived experience"]'::jsonb
)
ON CONFLICT (profile_id) DO NOTHING;

-- Profile 2 (Marcus Okonkwo) — Persona Fabulator emphasis
INSERT INTO identity_core (profile_id, thesis, invariants, master_keywords, intellectual_lineage, strategic_differentiators, tensions, constraints)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Identity is not a fixed document but a living narrative — the theatrical metaphor reveals what the bullet-point resume conceals.',
  '["Narrative computing reveals hidden capability", "Identity is constructed through technology and performance", "Research must make abstract concepts tangible", "Ethnographic insight grounds technical design"]'::jsonb,
  '["HCI", "creative coding", "identity studies", "narrative computing", "speculative design", "theatrical metaphors"]'::jsonb,
  '["Persona Fabulator: storyteller, artist, narrative designer", "Persona Sapiens: scholar, researcher across CHI/DIS/CSCW", "Persona Errans: boundary-pusher, experimenter in speculative design"]'::jsonb,
  '["Published in CHI, DIS, and CSCW", "Bridges ethnographic insight with interactive media", "Prototypes that make abstract concepts tangible", "Exploring theatrical metaphors for professional identity"]'::jsonb,
  '["Academic rigor vs creative freedom", "Human behavior research vs digital craft", "Self-presentation vs authentic identity"]'::jsonb,
  '["Masks are complementary, not contradictory", "Each stage calls forth different masks", "Context-responsive identity over fixed personas"]'::jsonb
)
ON CONFLICT (profile_id) DO NOTHING;

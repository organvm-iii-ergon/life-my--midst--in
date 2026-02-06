-- Profile 1: Senior Systems Architect — 12+ years, analytical/technical focus
INSERT INTO profiles (id, data, created_at, updated_at)
VALUES
('00000000-0000-0000-0000-000000000001',
 '{
  "id":"00000000-0000-0000-0000-000000000001",
  "identityId":"00000000-0000-0000-0000-000000000010",
  "slug":"elena-vasquez",
  "displayName":"Elena Vasquez",
  "title":"Principal Systems Architect",
  "headline":"Designing resilient distributed systems at the intersection of engineering rigor and human-centered thinking",
  "summaryMarkdown":"Twelve years building systems that serve millions — from real-time event pipelines to identity platforms. I care about architectural clarity, operational excellence, and the narratives we build around our technical decisions.\n\nI have led platform teams at three companies, authored RFC processes adopted organization-wide, and mentored 40+ engineers across career levels. My work sits at the boundary of systems thinking and organizational design.",
  "avatarUrl":"https://api.dicebear.com/9.x/personas/svg?seed=elena",
  "locationText":"San Francisco, CA",
  "email":"elena@example.com",
  "website":"https://elena-vasquez.dev",
  "externalIds":[
    {"system":"github","value":"https://github.com/elena-vasquez","label":"GitHub"},
    {"system":"linkedin","value":"https://linkedin.com/in/elena-vasquez","label":"LinkedIn"},
    {"system":"orcid","value":"https://orcid.org/0000-0001-2345-6789","label":"ORCID"}
  ],
  "languages":["English","Spanish","Portuguese"],
  "interests":["distributed systems","organizational design","technical writing","trail running"],
  "settings":{
    "visibility":"public",
    "defaultThemeId":"classic",
    "defaultLanguage":"en",
    "sectionOrder":{
      "sections":[
        {"type":"experience","isVisible":true,"sortOrder":1},
        {"type":"projects","isVisible":true,"sortOrder":2},
        {"type":"skills","isVisible":true,"sortOrder":3},
        {"type":"education","isVisible":true,"sortOrder":4},
        {"type":"publications","isVisible":true,"sortOrder":5},
        {"type":"awards","isVisible":true,"sortOrder":6},
        {"type":"certifications","isVisible":true,"sortOrder":7}
      ]
    },
    "agentAccess":{
      "enabled":true,
      "defaultMaskId":"architect",
      "allowedScopes":["read","narrative"]
    }
  },
  "isActive":true,
  "createdAt":"2024-01-01T00:00:00.000Z",
  "updatedAt":"2025-01-15T00:00:00.000Z"
 }',
 '2024-01-01T00:00:00.000Z','2025-01-15T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  data = EXCLUDED.data,
  updated_at = EXCLUDED.updated_at;

-- Profile 2: Creative Researcher & Designer — contrasting archetype
INSERT INTO profiles (id, data, created_at, updated_at)
VALUES
('00000000-0000-0000-0000-000000000002',
 '{
  "id":"00000000-0000-0000-0000-000000000002",
  "identityId":"00000000-0000-0000-0000-000000000020",
  "slug":"marcus-okonkwo",
  "displayName":"Marcus Okonkwo",
  "title":"Design Researcher & Creative Technologist",
  "headline":"Bridging ethnographic insight with interactive media to shape how people experience digital identity",
  "summaryMarkdown":"I work at the seam between human behavior and digital craft. My research explores how people construct identity through technology — from social media self-presentation to decentralized credential systems.\n\nWith a background spanning HCI research, interaction design, and creative coding, I build prototypes that make abstract concepts tangible. Published in CHI, DIS, and CSCW. Currently exploring narrative computing and theatrical metaphors for professional identity.",
  "avatarUrl":"https://api.dicebear.com/9.x/personas/svg?seed=marcus",
  "locationText":"London, UK",
  "email":"marcus@example.com",
  "website":"https://marcus-okonkwo.net",
  "externalIds":[
    {"system":"github","value":"https://github.com/marcus-okonkwo","label":"GitHub"},
    {"system":"linkedin","value":"https://linkedin.com/in/marcus-okonkwo","label":"LinkedIn"},
    {"system":"scholar","value":"https://scholar.google.com/citations?user=marcus","label":"Google Scholar"}
  ],
  "languages":["English","Igbo","French"],
  "interests":["HCI","creative coding","identity studies","jazz piano","speculative design"],
  "settings":{
    "visibility":"public",
    "defaultThemeId":"cognitive",
    "defaultLanguage":"en",
    "sectionOrder":{
      "sections":[
        {"type":"experience","isVisible":true,"sortOrder":1},
        {"type":"publications","isVisible":true,"sortOrder":2},
        {"type":"projects","isVisible":true,"sortOrder":3},
        {"type":"education","isVisible":true,"sortOrder":4},
        {"type":"skills","isVisible":true,"sortOrder":5},
        {"type":"awards","isVisible":true,"sortOrder":6}
      ]
    },
    "agentAccess":{
      "enabled":true,
      "defaultMaskId":"synthesist",
      "allowedScopes":["read","narrative"]
    }
  },
  "isActive":true,
  "createdAt":"2024-03-01T00:00:00.000Z",
  "updatedAt":"2025-01-20T00:00:00.000Z"
 }',
 '2024-03-01T00:00:00.000Z','2025-01-20T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  data = EXCLUDED.data,
  updated_at = EXCLUDED.updated_at;

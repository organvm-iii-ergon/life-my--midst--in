import type {
  Experience,
  Education,
  Project,
  Skill,
  Publication,
  Award,
  Certification,
  SocialLink,
} from '@in-midst-my-life/schema';

export type CvData = {
  experiences: Experience[];
  educations: Education[];
  projects: Project[];
  skills: Skill[];
  publications: Publication[];
  awards: Award[];
  certifications: Certification[];
  socialLinks: SocialLink[];
};

export type GraphNode = {
  id: string;
  type: string;
  label: string;
  subtitle?: string;
};

export type GraphLayoutMode = 'radial' | 'force';

export function buildGraphNodes(cvData: CvData): GraphNode[] {
  const nodes: GraphNode[] = [];
  cvData.experiences.forEach((exp) =>
    nodes.push({
      id: exp.id,
      type: 'experience',
      label: exp.roleTitle,
      subtitle: exp.organization,
    }),
  );
  cvData.educations.forEach((edu) =>
    nodes.push({ id: edu.id, type: 'education', label: edu.institution, subtitle: edu.degree }),
  );
  cvData.projects.forEach((project) =>
    nodes.push({ id: project.id, type: 'project', label: project.name, subtitle: project.role }),
  );
  cvData.skills.forEach((skill) =>
    nodes.push({ id: skill.id, type: 'skill', label: skill.name, subtitle: skill.level }),
  );
  cvData.publications.forEach((pub) =>
    nodes.push({ id: pub.id, type: 'publication', label: pub.title, subtitle: pub.venue }),
  );
  cvData.awards.forEach((award) =>
    nodes.push({ id: award.id, type: 'award', label: award.title, subtitle: award.issuer }),
  );
  return nodes;
}

export function buildNodePositionMap(
  nodes: GraphNode[],
  centerX = 180,
  centerY = 180,
  radius = 130,
) {
  const map = new Map<string, { x: number; y: number }>();
  const count = Math.max(nodes.length, 1);
  nodes.forEach((node, index) => {
    const angle = (index / count) * Math.PI * 2;
    map.set(node.id, {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  });
  return map;
}

export async function buildForcePositionMap(
  nodes: GraphNode[],
  centerX = 180,
  centerY = 180,
  radius = 130,
) {
  try {
    const { forceSimulation, forceManyBody, forceCenter, forceCollide } = await import('d3-force');
    type ForceNode = { id: string; x?: number; y?: number };
    const simNodes: ForceNode[] = nodes.map((node) => ({ id: node.id, x: centerX, y: centerY }));
    const simulation = forceSimulation(simNodes)
      .force('charge', forceManyBody().strength(-80))
      .force('center', forceCenter(centerX, centerY))
      .force('collide', forceCollide(18))
      .stop();
    for (let i = 0; i < 80; i += 1) {
      simulation.tick();
    }
    const map = new Map<string, { x: number; y: number }>();
    simulation.nodes().forEach((node) => {
      map.set(node.id, {
        x: node.x ?? centerX,
        y: node.y ?? centerY,
      });
    });
    return map;
  } catch {
    return buildNodePositionMap(nodes, centerX, centerY, radius);
  }
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { MermaidView } from '../../../../components/MermaidView';

const apiBase = process.env['NEXT_PUBLIC_API_BASE_URL'] || 'http://localhost:3001';

type Edge = {
  id: string;
  fromId: string;
  toId: string;
  relationType: string;
};

type Project = {
  id: string;
  name: string;
};

type Experience = {
  id: string;
  roleTitle: string;
  organization: string;
};

type Envelope<T> = { ok: boolean; data?: T };

export default function VisualSharePage() {
  const params = useParams();
  const profileId = params?.['profileId'] as string;
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) return;
    const load = async () => {
      try {
        const [projectsRes, experiencesRes, edgesRes] = await Promise.all([
          fetch(`${apiBase}/profiles/${profileId}/projects?offset=0&limit=200`),
          fetch(`${apiBase}/profiles/${profileId}/experiences?offset=0&limit=200`),
          fetch(`${apiBase}/profiles/${profileId}/graph/edges?offset=0&limit=400`),
        ]);
        if (!projectsRes.ok || !experiencesRes.ok || !edgesRes.ok) {
          throw new Error('Failed to load graph data.');
        }
        const projectsJson = (await projectsRes.json()) as Envelope<Project[]>;
        const experiencesJson = (await experiencesRes.json()) as Envelope<Experience[]>;
        const edgesJson = (await edgesRes.json()) as Envelope<Edge[]>;
        setProjects(projectsJson.data ?? []);
        setExperiences(experiencesJson.data ?? []);
        setEdges(edgesJson.data ?? []);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    void load();
  }, [profileId]);

  const chart = useMemo(() => {
    const nodes = new Map<string, string>();
    projects.forEach((project) => nodes.set(project.id, project.name));
    experiences.forEach((exp) => nodes.set(exp.id, `${exp.roleTitle} @ ${exp.organization}`));
    edges.forEach((edge) => {
      if (!nodes.has(edge.fromId)) nodes.set(edge.fromId, edge.fromId.slice(0, 6));
      if (!nodes.has(edge.toId)) nodes.set(edge.toId, edge.toId.slice(0, 6));
    });

    const nodeLines = Array.from(nodes.entries())
      .map(([id, label]) => `${id.replace(/-/g, '_')}["${label.replace(/"/g, "'")}"]`)
      .join('\n');
    const edgeLines = edges
      .map(
        (edge) =>
          `${edge.fromId.replace(/-/g, '_')} -->|${edge.relationType}| ${edge.toId.replace(/-/g, '_')}`,
      )
      .join('\n');
    return `graph LR\n${nodeLines}\n${edgeLines}`;
  }, [edges, experiences, projects]);

  if (error) {
    return (
      <main className="page" style={{ padding: '2rem' }}>
        <h2>Visual Graph Unavailable</h2>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className="page" style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Visual Career Architecture</h1>
        <p className="section-subtitle">
          A high-level map of projects and relationships derived from the profile graph.
        </p>
      </header>
      <MermaidView chart={chart} />
    </main>
  );
}

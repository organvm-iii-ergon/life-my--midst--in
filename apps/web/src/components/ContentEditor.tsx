'use client';

import { useState } from 'react';
import type { Experience, Project, Education, Skill } from '@in-midst-my-life/schema';
import { EntityList } from './EntityList';
import { EntityForm, type EntityType } from './EntityForm';

interface ContentEditorProps {
  experiences: Experience[];
  projects: Project[];
  educations: Education[];
  skills: Skill[];
  onDelete: (type: EntityType, id: string) => void;
  onCreate: (type: EntityType, data: Record<string, unknown>) => void;
}

export function ContentEditor({
  experiences,
  projects,
  educations,
  skills,
  onDelete,
  onCreate,
}: ContentEditorProps) {
  const [activeTab, setActiveTab] = useState<EntityType>('experience');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (data: Record<string, unknown>) => {
    onCreate(activeTab, data);
    setIsCreating(false);
  };

  return (
    <div className="section" style={{ marginTop: '1.5rem' }}>
      <h2 className="section-title">Content Editor</h2>
      <p className="section-subtitle">Manage your verifiable career history.</p>

      <div className="chip-row" style={{ marginBottom: '1.5rem' }}>
        {(['experience', 'project', 'education', 'skill'] as EntityType[]).map((type) => (
          <button
            key={type}
            className={`chip ${activeTab === type ? 'active' : ''}`}
            onClick={() => setActiveTab(type)}
            style={{ textTransform: 'capitalize' }}
          >
            {type}s
          </button>
        ))}
      </div>

      {activeTab === 'experience' && (
        <EntityList
          title="Experiences"
          items={experiences}
          onCreate={() => setIsCreating(true)}
          onDelete={(id) => onDelete('experience', id)}
          renderItem={(item) => (
            <div>
              <strong>{item.roleTitle}</strong> @ {item.organization}
              <div className="section-subtitle">
                {item.startDate} - {item.endDate ?? 'Present'}
              </div>
            </div>
          )}
        />
      )}

      {activeTab === 'project' && (
        <EntityList
          title="Projects"
          items={projects}
          onCreate={() => setIsCreating(true)}
          onDelete={(id) => onDelete('project', id)}
          renderItem={(item) => (
            <div>
              <strong>{item.name}</strong>
              <div className="section-subtitle">{item.role}</div>
            </div>
          )}
        />
      )}

      {activeTab === 'education' && (
        <EntityList
          title="Education"
          items={educations}
          onCreate={() => setIsCreating(true)}
          onDelete={(id) => onDelete('education', id)}
          renderItem={(item) => (
            <div>
              <strong>{item.institution}</strong>
              <div className="section-subtitle">{item.degree}</div>
            </div>
          )}
        />
      )}

      {activeTab === 'skill' && (
        <EntityList
          title="Skills"
          items={skills}
          onCreate={() => setIsCreating(true)}
          onDelete={(id) => onDelete('skill', id)}
          renderItem={(item) => (
            <div>
              <strong>{item.name}</strong>
              <div className="section-subtitle">{item.category}</div>
            </div>
          )}
        />
      )}

      {isCreating && (
        <EntityForm
          type={activeTab}
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
        />
      )}
    </div>
  );
}

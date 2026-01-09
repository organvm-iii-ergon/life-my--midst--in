'use client';

import { useState } from 'react';

export type EntityType = 'experience' | 'project' | 'education' | 'skill';

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'checkbox';
  required?: boolean;
}

const FORM_CONFIGS: Record<EntityType, FieldConfig[]> = {
  experience: [
    { name: 'roleTitle', label: 'Role Title', type: 'text', required: true },
    { name: 'organization', label: 'Organization', type: 'text', required: true },
    { name: 'startDate', label: 'Start Date', type: 'date', required: true },
    { name: 'endDate', label: 'End Date', type: 'date' },
    { name: 'descriptionMarkdown', label: 'Description', type: 'textarea' },
  ],
  project: [
    { name: 'name', label: 'Project Name', type: 'text', required: true },
    { name: 'role', label: 'Role', type: 'text' },
    { name: 'startDate', label: 'Start Date', type: 'date' },
    { name: 'endDate', label: 'End Date', type: 'date' },
    { name: 'descriptionMarkdown', label: 'Description', type: 'textarea' },
  ],
  education: [
    { name: 'institution', label: 'Institution', type: 'text', required: true },
    { name: 'degree', label: 'Degree', type: 'text' },
    { name: 'fieldOfStudy', label: 'Field of Study', type: 'text' },
    { name: 'startDate', label: 'Start Date', type: 'date' },
    { name: 'endDate', label: 'End Date', type: 'date' },
  ],
  skill: [
    { name: 'name', label: 'Skill Name', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'text' }, // Simplified for now
  ],
};

interface EntityFormProps {
  type: EntityType;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}

export function EntityForm({ type, onSubmit, onCancel }: EntityFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const fields = FORM_CONFIGS[type];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="immersive" style={{ zIndex: 200 }}>
      <div className="immersive-card fade-up" style={{ maxWidth: '600px' }}>
        <h3 style={{ marginTop: 0, textTransform: 'capitalize' }}>Add {type}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          {fields.map((field) => (
            <label key={field.name}>
              <div className="label">
                {field.label} {field.required ? '*' : ''}
              </div>
              {field.type === 'textarea' ? (
                <textarea
                  className="input"
                  rows={4}
                  required={field.required}
                  value={(formData[field.name] as string) || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              ) : (
                <input
                  className="input"
                  type={field.type}
                  required={field.required}
                  value={(formData[field.name] as string) || ''}
                  onChange={(e) =>
                    handleChange(
                      field.name,
                      field.type === 'checkbox' ? e.target.checked : e.target.value,
                    )
                  }
                />
              )}
            </label>
          ))}
          <div className="hero-actions" style={{ marginTop: '1rem' }}>
            <button type="submit" className="button">
              Save
            </button>
            <button type="button" className="button secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

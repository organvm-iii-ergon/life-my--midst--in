'use client';

import { useState, useEffect } from 'react';
import { Share2, MessageSquare, Heart, ExternalLink, Github, Linkedin, Globe, Eye } from 'lucide-react';
import Link from 'next/link';

interface PersonaPreview {
  id: string;
  name: string;
  description: string;
  coreValues: string[];
  topSkills: string[];
}

interface PublicProfile {
  id: string;
  slug: string;
  name: string;
  headline: string;
  bio: string;
  avatar?: string;
  visiblePersonas: PersonaPreview[];
  visibleExperiences: number;
  viewCount: number;
  lastUpdated: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  featured?: {
    projects: Array<{ name: string; description: string; url: string }>;
    achievements: string[];
  };
}

export default function PublicProfilePage({ params }: { params: { slug: string } }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [params.slug]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/public-profiles/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        if (data.visiblePersonas.length > 0) {
          setSelectedPersona(data.visiblePersonas[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!profile) return;

    const shareText = `Check out ${profile.name}'s profile on in–midst–my–life`;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (navigator.share) {
      try {
        await navigator.share({
          title: profile.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      // Show toast notification
    }
  };

  const handleLike = async () => {
    if (!profile) return;

    try {
      const response = await fetch(`/api/public-profiles/${profile.id}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error('Failed to like profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600">This profile is either private or doesn't exist.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium mt-4 inline-block">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const selectedPersonaData = profile.visiblePersonas.find((p) => p.id === selectedPersona);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between gap-6 mb-6">
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0"></div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="text-lg text-gray-600 mt-1">{profile.headline}</p>
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>{profile.viewCount} views</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{profile.bio}</p>

              {/* Social Links */}
              {profile.socialLinks && (
                <div className="flex gap-3 mb-4">
                  {profile.socialLinks.github && (
                    <a
                      href={profile.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="GitHub"
                    >
                      <Github className="w-5 h-5 text-gray-600" />
                    </a>
                  )}
                  {profile.socialLinks.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5 text-gray-600" />
                    </a>
                  )}
                  {profile.socialLinks.website && (
                    <a
                      href={profile.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Website"
                    >
                      <Globe className="w-5 h-5 text-gray-600" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-col sm:flex-row">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  isLiked
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">Save</span>
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <MessageSquare className="w-5 h-5" />
                <span className="hidden sm:inline">Message</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={handleShare}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-sm"
                    >
                      Share Profile
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setShowShareMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-sm border-t border-gray-200"
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personas Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="font-bold text-gray-900 mb-4">Personas</h2>
              <div className="space-y-2">
                {profile.visiblePersonas.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium ${
                      selectedPersona === persona.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {persona.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Persona Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedPersonaData && (
              <>
                {/* Persona Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedPersonaData.name}</h3>
                  <p className="text-gray-700 mb-4">{selectedPersonaData.description}</p>

                  {/* Core Values */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Core Values</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPersonaData.coreValues.map((value) => (
                        <span key={value} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Top Skills */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Top Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPersonaData.topSkills.map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Featured Work */}
                {profile.featured && profile.featured.projects.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Featured Projects</h3>
                    <div className="space-y-3">
                      {profile.featured.projects.map((project, idx) => (
                        <a
                          key={idx}
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {project.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {profile.featured && profile.featured.achievements.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Achievements</h3>
                    <ul className="space-y-2">
                      {profile.featured.achievements.map((achievement, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-yellow-500 mt-1">★</span>
                          <span className="text-gray-700">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>Last updated: {new Date(profile.lastUpdated).toLocaleDateString()}</p>
          <p className="mt-1">
            Part of{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              in–midst–my–life
            </Link>
            —where authentic professional identity meets community
          </p>
        </div>
      </div>
    </div>
  );
}

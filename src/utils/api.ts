import { Project, ArchiveItem, Capability, StudioInfo, TeamMember, SocialPost, SocialLink, ContactSubmission } from '../types';
import db from '../../server/data/db.json';

const delay = <T>(data: T, ms = 200): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(data), ms));

export const api = {
  getProjects: () => delay((db.projects || []) as Project[]),
  getFeaturedProjects: () => delay(((db.projects || []) as Project[]).filter(p => p.featured)),
  getProjectBySlug: (slug: string) => delay(((db.projects || []) as Project[]).find(p => p.slug === slug) as Project),
  getArchive: () => delay((db.archive || []) as ArchiveItem[]),
  getCapabilities: () => delay((db.capabilities || []) as Capability[]),
  getStudio: () => delay((db.studio || {}) as StudioInfo),
  getManifesto: () => delay((db.manifesto || []) as string[]),
  getTeam: () => delay((db.team || []) as TeamMember[]),
  getSocialPosts: () => delay((db.socialPosts || []) as SocialPost[]),
  getSocialLinks: () => delay((db.socialLinks || []) as SocialLink[]),
  submitContact: (data: any) => delay({ ...data, id: Date.now().toString(), createdAt: new Date().toISOString(), status: 'NEW' } as ContactSubmission),
  admin: {
    getProjects: () => delay((db.projects || []) as Project[]),
    createProject: (data: any) => delay({ ...data, id: Date.now().toString(), slug: 'new-project' } as Project),
    updateProject: (id: string, data: Project) => delay(data),
    deleteProject: (id: string) => delay({ id }),
    getContacts: () => delay([] as ContactSubmission[]),
    updateContact: (id: string, status: string) => delay({ id, status } as any),
  }
};
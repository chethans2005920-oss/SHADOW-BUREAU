export interface ProjectMedia {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  isCover: boolean;
  altText: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Capability {
  id: string;
  name: string;
  description: string | null;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  year: number;
  projectType: 'CLIENT' | 'SPEC' | 'SELF_INITIATED' | 'COLLABORATION';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  client: string | null;
  location: string | null;
  objective: string | null;
  approach: string | null;
  execution: string | null;
  results: string | null;
  accentColor: string | null;
  media: ProjectMedia[];
  categories: Category[];
  capabilities: Capability[];
}

export interface ArchiveItem {
  id: string;
  title: string;
  projectType: 'CLIENT' | 'SPEC' | 'SELF_INITIATED' | 'COLLABORATION';
  year: number;
  category: string;
  client: string | null;
  linkUrl: string | null;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  imageUrl: string | null;
}

export interface SocialPost {
  id: string;
  title: string;
  platform: string;
  date: string;
  content: string;
  imageUrl: string | null;
  linkUrl: string;
}

export interface SocialLink {
  id: string;
  name: string;
  url: string;
}

export interface StudioInfo {
  name: string;
  description: string;
  location: string;
  founded: number;
  contactEmail: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  projectType: string;
  budget: string;
  description: string;
  status: 'NEW' | 'REVIEWED' | 'ARCHIVED';
  createdAt: string;
}

// Uniform API Success Response Envelope
export interface ApiResponse<T> {
  success: true;
  data: T;
}

// Uniform API Paginated Success Response Envelope
export interface ApiPaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Uniform API Error Response Envelope
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details: any | null;
    requestId: string;
  };
}

import axios from 'axios';
import { Proposal, ProposalContentPage, StaticSlide, ContentPageType } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login or refresh token
      localStorage.removeItem('auth_token');
      // You can add redirect logic here if needed
    }
    return Promise.reject(error);
  }
);

// Transform backend response to frontend format
const transformProposal = (backendProposal: any): Proposal => {
  return {
    id: backendProposal.id,
    created_by: backendProposal.created_by,
    created_by_name: backendProposal.created_by_name,
    created_at: backendProposal.created_at,
    last_modified: new Date(backendProposal.last_modified).getTime(),
    lastModified: new Date(backendProposal.last_modified).getTime(),
    prepared_for: backendProposal.prepared_for || '',
    prepared_by: backendProposal.prepared_by || '',
    project_type: backendProposal.project_type || '',
    date: backendProposal.date || '',
    title: backendProposal.prepared_for || 'Untitled',
    clientName: backendProposal.prepared_for || '',
    cover: {
      preparedFor: backendProposal.prepared_for || '',
      preparedBy: backendProposal.prepared_by || '',
      projectType: backendProposal.project_type || '',
      date: backendProposal.date || '',
    },
    includeShowcase: true,
    pages: (backendProposal.pages || []).map((page: any) => ({
      id: page.id,
      type: page.type as ContentPageType,
      title: page.title,
      content: page.content,
      is_visible: page.is_visible,
      isVisible: page.is_visible,
      order: page.order,
      created_at: page.created_at,
    })),
    static_slides: backendProposal.static_slides || [],
  };
};

// Transform frontend data to backend format
const transformToBackend = (proposal: Partial<Proposal>) => {
  return {
    prepared_for: proposal.prepared_for,
    prepared_by: proposal.prepared_by,
    project_type: proposal.project_type,
    date: proposal.date,
  };
};

// API Service
export const proposalApi = {
  // Get all proposals
  async getAll(): Promise<Proposal[]> {
    const response = await api.get('/proposals/proposals/');
    // Handle both paginated and non-paginated responses
    const data = response.data.results || response.data;
    if (!Array.isArray(data)) {
      console.error('Unexpected API response:', response.data);
      return [];
    }
    return data.map((p: any) => ({
      ...p,
      last_modified: new Date(p.last_modified).getTime(),
      pages: [],
      static_slides: [],
    }));
  },

  // Get single proposal with all details
  async getById(id: string): Promise<Proposal> {
    const response = await api.get(`/proposals/proposals/${id}/`);
    return transformProposal(response.data);
  },

  // Create new proposal
  async create(data: Partial<Proposal>): Promise<Proposal> {
    const response = await api.post('/proposals/proposals/', transformToBackend(data));
    return transformProposal(response.data);
  },

  // Update proposal
  async update(id: string, data: Partial<Proposal>): Promise<Proposal> {
    const response = await api.patch(`/proposals/proposals/${id}/`, transformToBackend(data));
    return transformProposal(response.data);
  },

  // Delete proposal
  async delete(id: string): Promise<void> {
    await api.delete(`/proposals/proposals/${id}/`);
  },

  // Add page to proposal
  async addPage(proposalId: string, page: Partial<ProposalContentPage>): Promise<ProposalContentPage> {
    const response = await api.post(`/proposals/proposals/${proposalId}/add_page/`, {
      type: page.type,
      title: page.title,
      content: page.content,
      is_visible: page.is_visible ?? true,
      order: page.order ?? 0,
    });
    return response.data;
  },

  // Update page
  async updatePage(pageId: string, data: Partial<ProposalContentPage>): Promise<ProposalContentPage> {
    const response = await api.patch(`/proposals/pages/${pageId}/`, data);
    return response.data;
  },

  // Delete page
  async deletePage(pageId: string): Promise<void> {
    await api.delete(`/proposals/pages/${pageId}/`);
  },

  // Toggle page visibility
  async togglePageVisibility(pageId: string): Promise<{ is_visible: boolean }> {
    const response = await api.patch(`/proposals/pages/${pageId}/toggle_visibility/`);
    return response.data;
  },

  // Reorder pages
  async reorderPages(proposalId: string, pageOrders: { id: string; order: number }[]): Promise<void> {
    await api.post(`/proposals/proposals/${proposalId}/reorder_pages/`, {
      page_orders: pageOrders,
    });
  },

  // Add static slide
  async addSlide(proposalId: string, slide: Partial<StaticSlide>): Promise<StaticSlide> {
    const response = await api.post(`/proposals/proposals/${proposalId}/add_slide/`, slide);
    return response.data;
  },

  // Update slide
  async updateSlide(slideId: number, data: Partial<StaticSlide>): Promise<StaticSlide> {
    const response = await api.patch(`/proposals/slides/${slideId}/`, data);
    return response.data;
  },

  // Delete slide
  async deleteSlide(slideId: number): Promise<void> {
    await api.delete(`/proposals/slides/${slideId}/`);
  },
};

// Auth API (if you need it later)
export const authApi = {
  async login(email: string, password: string): Promise<{ access: string; refresh: string }> {
    const response = await api.post('/auth/login/', { email, password });
    return response.data;
  },

  async refreshToken(refresh: string): Promise<{ access: string }> {
    const response = await api.post('/auth/refresh/', { refresh });
    return response.data;
  },

  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  },

  removeToken() {
    localStorage.removeItem('auth_token');
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },
};

export default api;

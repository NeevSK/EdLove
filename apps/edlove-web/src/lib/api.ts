/**
 * EDLOVE API CLIENT
 * 
 * Centralized API communication layer
 * Handles all backend requests with consistent error handling
 * 
 * Usage:
 *   import { api } from '@/lib/api';
 *   const paradigms = await api.paradigms.getAll();
 */

import type {
    APIResponse,
    PaginatedResponse,
    Paradigm,
    Thinker,
    Guide,
    Story,
    Framework,
    Discussion,
    Reply,
    SearchResult,
    FilterOptions,
    NewsletterSubscription,
    ContactForm,
    ResourceSubmission,
    User,
} from '../types/index';

// ============================================================================
// API CONFIGURATION
// ============================================================================

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || '/api';
const DEFAULT_TIMEOUT = 10000; // 10 seconds

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class APIError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public details?: any
    ) {
        super(message);
        this.name = 'APIError';
    }
}

export class NetworkError extends Error {
    constructor(message: string = 'Network request failed') {
        super(message);
        this.name = 'NetworkError';
    }
}

export class ValidationError extends Error {
    constructor(message: string, public fields?: Record<string, string>) {
        super(message);
        this.name = 'ValidationError';
    }
}

// ============================================================================
// HTTP CLIENT
// ============================================================================

class HTTPClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    /**
     * Generic fetch wrapper with error handling
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<APIResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;

        // Add default headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Parse response
            const data = await response.json();

            // Handle errors
            if (!response.ok) {
                throw new APIError(
                    data.message || 'Request failed',
                    response.status,
                    data
                );
            }

            return data as APIResponse<T>;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof APIError) {
                throw error;
            }

            if (error instanceof Error && error.name === 'AbortError') {
                throw new NetworkError('Request timeout');
            }

            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new NetworkError('Network request failed');
            }

            throw new Error('Unexpected error occurred');
        }
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const queryString = params
            ? '?' + new URLSearchParams(params).toString()
            : '';
        const response = await this.request<T>(`${endpoint}${queryString}`, {
            method: 'GET',
        });
        return response.data!;
    }

    /**
     * POST request
     */
    async post<T>(endpoint: string, body?: any): Promise<T> {
        const response = await this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
        return response.data!;
    }

    /**
     * PUT request
     */
    async put<T>(endpoint: string, body?: any): Promise<T> {
        const response = await this.request<T>(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
        return response.data!;
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string): Promise<T> {
        const response = await this.request<T>(endpoint, {
            method: 'DELETE',
        });
        return response.data!;
    }

    /**
     * PATCH request
     */
    async patch<T>(endpoint: string, body?: any): Promise<T> {
        const response = await this.request<T>(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
        return response.data!;
    }
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

const client = new HTTPClient(API_BASE_URL);

/**
 * Paradigms API
 */
export const paradigmsAPI = {
    /**
     * Get all paradigms
     */
    async getAll(): Promise<Paradigm[]> {
        return client.get<Paradigm[]>('/paradigms');
    },

    /**
     * Get paradigm by ID
     */
    async getById(id: string): Promise<Paradigm> {
        return client.get<Paradigm>(`/paradigms/${id}`);
    },

    /**
     * Get paradigm by slug
     */
    async getBySlug(slug: string): Promise<Paradigm> {
        return client.get<Paradigm>(`/paradigms/slug/${slug}`);
    },
};

/**
 * Thinkers API
 */
export const thinkersAPI = {
    async getAll(filters?: FilterOptions): Promise<Thinker[]> {
        return client.get<Thinker[]>('/thinkers', filters);
    },

    async getById(id: string): Promise<Thinker> {
        return client.get<Thinker>(`/thinkers/${id}`);
    },

    async getBySlug(slug: string): Promise<Thinker> {
        return client.get<Thinker>(`/thinkers/slug/${slug}`);
    },

    async getByParadigm(paradigmId: string): Promise<Thinker[]> {
        return client.get<Thinker[]>(`/paradigms/${paradigmId}/thinkers`);
    },
};

/**
 * Guides API
 */
export const guidesAPI = {
    async getAll(filters?: FilterOptions): Promise<Guide[]> {
        return client.get<Guide[]>('/guides', filters);
    },

    async getById(id: string): Promise<Guide> {
        return client.get<Guide>(`/guides/${id}`);
    },

    async getBySlug(slug: string): Promise<Guide> {
        return client.get<Guide>(`/guides/slug/${slug}`);
    },

    async getByParadigm(paradigmId: string): Promise<Guide[]> {
        return client.get<Guide[]>(`/paradigms/${paradigmId}/guides`);
    },

    async getByDifficulty(difficulty: 'introductory' | 'intermediate' | 'deep'): Promise<Guide[]> {
        return client.get<Guide[]>('/guides', { difficulty });
    },
};

/**
 * Stories API
 */
export const storiesAPI = {
    async getAll(filters?: FilterOptions): Promise<Story[]> {
        return client.get<Story[]>('/stories', filters);
    },

    async getById(id: string): Promise<Story> {
        return client.get<Story>(`/stories/${id}`);
    },

    async getBySlug(slug: string): Promise<Story> {
        return client.get<Story>(`/stories/slug/${slug}`);
    },

    async getByType(type: Story['story_type']): Promise<Story[]> {
        return client.get<Story[]>('/stories', { story_type: type });
    },
};

/**
 * Frameworks API
 */
export const frameworksAPI = {
    async getAll(): Promise<Framework[]> {
        return client.get<Framework[]>('/frameworks');
    },

    async getById(id: string): Promise<Framework> {
        return client.get<Framework>(`/frameworks/${id}`);
    },

    async getBySlug(slug: string): Promise<Framework> {
        return client.get<Framework>(`/frameworks/slug/${slug}`);
    },
};

/**
 * Search API
 */
export const searchAPI = {
    /**
     * Search all content
     */
    async search(
        query: string,
        filters?: FilterOptions
    ): Promise<SearchResult[]> {
        return client.get<SearchResult[]>('/search', {
            q: query,
            ...filters,
        });
    },

    /**
     * Get search suggestions (autocomplete)
     */
    async suggestions(query: string): Promise<string[]> {
        return client.get<string[]>('/search/suggestions', { q: query });
    },
};

/**
 * Community / Sangha API
 */
export const communityAPI = {
    /**
     * Discussions
     */
    discussions: {
        async getAll(
            page: number = 1,
            perPage: number = 20
        ): Promise<PaginatedResponse<Discussion>> {
            return client.get<PaginatedResponse<Discussion>>('/discussions', {
                page,
                per_page: perPage,
            });
        },

        async getById(id: string): Promise<Discussion> {
            return client.get<Discussion>(`/discussions/${id}`);
        },

        async create(discussion: Partial<Discussion>): Promise<Discussion> {
            return client.post<Discussion>('/discussions', discussion);
        },

        async update(id: string, updates: Partial<Discussion>): Promise<Discussion> {
            return client.patch<Discussion>(`/discussions/${id}`, updates);
        },

        async delete(id: string): Promise<void> {
            return client.delete<void>(`/discussions/${id}`);
        },

        async like(id: string): Promise<void> {
            return client.post<void>(`/discussions/${id}/like`);
        },
    },

    /**
     * Replies
     */
    replies: {
        async getByDiscussion(discussionId: string): Promise<Reply[]> {
            return client.get<Reply[]>(`/discussions/${discussionId}/replies`);
        },

        async create(discussionId: string, reply: Partial<Reply>): Promise<Reply> {
            return client.post<Reply>(`/discussions/${discussionId}/replies`, reply);
        },

        async update(id: string, updates: Partial<Reply>): Promise<Reply> {
            return client.patch<Reply>(`/replies/${id}`, updates);
        },

        async delete(id: string): Promise<void> {
            return client.delete<void>(`/replies/${id}`);
        },

        async like(id: string): Promise<void> {
            return client.post<void>(`/replies/${id}/like`);
        },
    },
};

/**
 * Forms API (Newsletter, Contact, Resource Submission)
 */
export const formsAPI = {
    /**
     * Subscribe to newsletter
     */
    async subscribeNewsletter(data: NewsletterSubscription): Promise<void> {
        return client.post<void>('/newsletter/subscribe', data);
    },

    /**
     * Submit contact form
     */
    async submitContact(data: ContactForm): Promise<void> {
        return client.post<void>('/contact', data);
    },

    /**
     * Submit resource for review
     */
    async submitResource(data: ResourceSubmission): Promise<void> {
        return client.post<void>('/resources/submit', data);
    },
};

/**
 * Analytics API
 */
export const analyticsAPI = {
    /**
     * Track page view
     */
    async trackPageView(url: string, title: string): Promise<void> {
        return client.post<void>('/analytics/pageview', { url, title });
    },

    /**
     * Track custom event
     */
    async trackEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
        return client.post<void>('/analytics/event', {
            event_name: eventName,
            properties,
        });
    },
};

// ============================================================================
// MAIN API EXPORT
// ============================================================================

export const api = {
    paradigms: paradigmsAPI,
    thinkers: thinkersAPI,
    guides: guidesAPI,
    stories: storiesAPI,
    frameworks: frameworksAPI,
    search: searchAPI,
    community: communityAPI,
    forms: formsAPI,
    analytics: analyticsAPI,
};

export default api;

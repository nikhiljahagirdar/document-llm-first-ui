import { cleanS3URL } from "@/lib/utils";
import * as Types from "@/types/api";
import { db } from "./db";

let base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").trim();
if (base.endsWith("/api")) {
  base = base.substring(0, base.length - 4);
}
export const API_BASE_URL = base;
export const CLIENT_ID = (
  process.env.NEXT_PUBLIC_CLIENT_ID || "doc-intel-ui-v1"
).trim();
export const CLIENT_SECRET = (
  process.env.NEXT_PUBLIC_CLIENT_SECRET || "super-secret-app-key-2026"
).trim();

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

let authToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

function getCurrentToken(): string | null {
  if (authToken && authToken !== "undefined" && authToken !== "null")
    return authToken;

  if (typeof window !== "undefined") {
    try {
      const persisted = localStorage.getItem("auth-storage");
      if (persisted) {
        const parsed = JSON.parse(persisted);
        const token = parsed.state?.token;
        if (token && token !== "undefined" && token !== "null") return token;
      }
    } catch {}
  }
  return null;
}

function recursiveClean(data: any): any {
  if (typeof data === "string") {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => recursiveClean(item));
  }
  if (data !== null && typeof data === "object") {
    const cleaned: any = {};
    for (const key in data) {
      cleaned[key] = recursiveClean(data[key]);
    }
    return cleaned;
  }
  return data;
}

async function fetchAPI<T = any>(
  endpoint: string,
  options: RequestInit & { skipAuth?: boolean; silent?: boolean } = {},
): Promise<T> {
  const { skipAuth, silent, ...fetchOptions } = options;

  const path = endpoint.split("?")[0];
  const cleanPath = path.endsWith("/") ? path.slice(0, -1) : path;

  const publicPaths = [
    "/api",
    "/api/",
    "/api/users/register",
    "/api/users/login",
    "/api/plans",
    "/api/industries",
    "/api/roles",
    "/api/users/google-auth",
    "/api/billing/checkout",
    "/api/billing/webhooks",
  ];
  const isPublic =
    skipAuth ||
    publicPaths.includes(cleanPath) ||
    cleanPath.startsWith("/api/templates/public") ||
    cleanPath.includes("/auth/");

  const headers = new Headers(fetchOptions.headers);
  headers.set("X-Client-ID", CLIENT_ID);
  headers.set("X-Client-Secret", CLIENT_SECRET);

  const token = getCurrentToken();
  if (!isPublic && token) {
    // Only custom header 'X-Token' is required for authenticated requests
    headers.set("X-Token", token.trim());
  }

  if (!headers.has("Content-Type")) {
    if (fetchOptions.body instanceof FormData) {
      // Browser sets correctly
    } else if (fetchOptions.body instanceof URLSearchParams) {
      headers.set("Content-Type", "application/x-www-form-urlencoded");
    } else if (fetchOptions.body) {
      headers.set("Content-Type", "application/json");
    }
  }

  const isGet = !fetchOptions.method || fetchOptions.method.toUpperCase() === "GET";
  let cacheKey = "";
  
  if (isGet && typeof window !== "undefined") {
    try {
      const persisted = localStorage.getItem("auth-storage");
      let uid = "anon";
      if (persisted) {
        const state = JSON.parse(persisted)?.state;
        uid = state?.user?.id || state?.user?.email || "anon";
      }
      cacheKey = `cache:${uid}:${endpoint}`;
    } catch {}
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });
  } catch (fetchErr) {
    // Offline fallback
    if (isGet && cacheKey) {
      try {
        const entry = await db.apiCache.get(cacheKey);
        if (entry) {
          console.log(`[OFFLINE] Serving cached data for: ${endpoint}`);
          return entry.data as T;
        }
      } catch {}
    }
    throw fetchErr;
  }

  if (!response.ok) {
    // Fallback for common server errors if available
    if (isGet && cacheKey && response.status >= 500) {
      try {
        const entry = await db.apiCache.get(cacheKey);
        if (entry) {
          console.warn(`[FALLBACK] Serving cached data due to error ${response.status} for: ${endpoint}`);
          return entry.data as T;
        }
      } catch {}
    }

    let message = "Request failed";
    try {
      const errorData = await response.json();
      message = errorData.detail || JSON.stringify(errorData);
      if (Array.isArray(errorData.detail)) {
        message = errorData.detail.map((err: any) => err.msg).join(", ");
      }
    } catch {}

    const isDocContent404 = response.status === 404 && endpoint.includes("/content");
    if (!silent && !isDocContent404) {
      console.error(`API Error [${response.status}] ${endpoint}:`, message);
    } else if (isDocContent404 && !silent) {
      console.warn(`API Info [${response.status}] ${endpoint}:`, message);
    }

    // Log to file via server-side route
    try {
      fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint,
          status: response.status,
          message,
          timestamp: new Date().toISOString(),
          method: fetchOptions.method || "GET",
        }),
      }).catch(() => {}); // Silent fail if logging fails
    } catch {}

    // Handle 401 unauthorized automatically to clear stale storage
    if (response.status === 401 && typeof window !== "undefined" && !isPublic) {
      console.warn("Auth session expired or invalid. Clearing context.");
      localStorage.removeItem("auth-storage");
      // Check current location to prevent recursive redirect loops
      if (!window.location.pathname.includes("/login")) {
         window.location.href = "/login?reason=expired";
      }
    }

    throw new APIError(response.status, message);
  }

  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return null as T;
  }

  try {
    const rawData = await response.json();
    const data = recursiveClean(rawData) as T;
    
    // Cache the clean response
    if (isGet && cacheKey && data) {
      db.apiCache.put({
        key: cacheKey,
        data: data,
        timestamp: Date.now()
      }).catch(() => {});
    }
    
    return data;
  } catch (e) {
    return null as T;
  }
}

export const api = {
  // --- USERS ---
  login: async (email: string, password: string): Promise<Types.Token> => {
    const details = new URLSearchParams();
    details.append("username", email);
    details.append("password", password);

    const result = await fetchAPI<Types.Token>("/api/users/login", {
      method: "POST",
      body: details,
      skipAuth: true,
    });

    if (result?.access_token) {
      setAuthToken(result.access_token);
    }
    return result;
  },
  registerUser: async (data: Types.UserCreate): Promise<Types.Token> => {
    const result = await fetchAPI<Types.Token>("/api/users/register", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    });
    if (result?.access_token) {
      setAuthToken(result.access_token);
    }
    return result;
  },

  googleAuth: (data: Types.GoogleAuthRequest): Promise<Types.Token> =>
    fetchAPI<Types.Token>("/api/users/google-auth", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  socialLogin: (
    provider: "google",
    token: string,
    data?: Record<string, any>,
  ): Promise<Types.Token> => {
    if (provider === "google") {
      return api.googleAuth({
        email: data?.email,
        google_id: data?.google_id,
        code: token,
        first_name: data?.first_name,
        last_name: data?.last_name,
        image_url: data?.image_url,
        tenant_id: data?.tenant_id,
      });
    }
    throw new Error(`Provider ${provider} not supported`);
  },

  getMe: (): Promise<Types.UserResponse> =>
    fetchAPI<Types.UserResponse>("/api/users/me"),
  getRoles: (): Promise<Types.RoleResponse[]> =>
    fetchAPI<Types.RoleResponse[]>("/api/roles"),

  // --- TENANTS ---
  registerTenant: (data: Types.TenantBase): Promise<Types.TenantResponse> =>
    fetchAPI<Types.TenantResponse>("/api/tenants/register", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),
  getTenantDashboard: (): Promise<any> =>
    fetchAPI<any>("/api/tenants/dashboard"),
  getTenantSettings: (tenantId: string): Promise<Record<string, any>> =>
    fetchAPI<Record<string, any>>(`/api/tenants/${tenantId}/settings`),
  updateTenantSettings: (
    tenantId: string,
    data: Record<string, any>,
  ): Promise<Record<string, any>> =>
    fetchAPI<Record<string, any>>(`/api/tenants/${tenantId}/settings`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // --- DOCUMENTS ---
  getDocuments: (
    search?: string,
    folderId?: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Types.DocumentListResponse[]> => {
    let url = "/api/documents";
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (folderId) params.append("folder_id", folderId);
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    const q = params.toString();
    if (q) url += `?${q}`;
    return fetchAPI<Types.DocumentListResponse[]>(url);
  },
  getDocument: (docId: string): Promise<Types.DocumentResponse> =>
    fetchAPI<Types.DocumentResponse>(`/api/documents/${docId}`),
  importGoogleDoc: (
    data: Types.GoogleDocImportRequest,
  ): Promise<Types.DocumentResponse> =>
    fetchAPI<Types.DocumentResponse>("/api/documents/import/google", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  uploadDocument: (
    formData: FormData,
    queryParams: Record<string, string | null | undefined> = {},
  ): Promise<Types.DocumentResponse> => {
    // Append query params to FormData if they are not already there
    for (const key in queryParams) {
      const val = queryParams[key];
      if (val && !formData.has(key)) {
        formData.append(key, val);
      }
    }
    return fetchAPI<Types.DocumentResponse>("/api/documents/upload", {
      method: "POST",
      body: formData,
    });
  },
  createDocumentManual: (
    data: Types.DocumentCreateManual,
  ): Promise<Types.DocumentResponse> =>
    fetchAPI<Types.DocumentResponse>("/api/documents/manual", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createDocumentFromTemplate: (
    data: Types.DocumentCreateFromTemplate,
  ): Promise<Types.DocumentResponse> =>
    fetchAPI<Types.DocumentResponse>("/api/documents/from-template", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteDocument: (docId: string): Promise<null> =>
    fetchAPI<null>(`/api/documents/${docId}`, { method: "DELETE" }),
  reprocessDocument: (docId: string): Promise<any> =>
    fetchAPI<any>(`/api/documents/${docId}/reprocess`, { method: "POST" }),
  getDocumentContent: (
    docId: string,
    page: number = 1,
    pageSize: number = 10000,
  ): Promise<Types.PaginatedDocumentContentResponse> =>
    fetchAPI<Types.PaginatedDocumentContentResponse>(
      `/api/documents/${docId}/content?page=${page}&page_size=${pageSize}`,
      { silent: true },
    ),
  updateDocumentContent: (
    docId: string,
    content: string,
  ): Promise<Types.DocumentContentResponse> =>
    fetchAPI<Types.DocumentContentResponse>(`/api/documents/${docId}/content`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    }),

  // --- LLM ---
  detectIndustry: (
    data: Types.IndustryDetectionRequest,
  ): Promise<Types.IndustryDetectionResponse> =>
    fetchAPI<Types.IndustryDetectionResponse>("/api/llm/detect-industry", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  generateDocument: (
    data: Types.DocumentGenerationRequest,
  ): Promise<Types.DocumentGenerationResponse> =>
    fetchAPI<Types.DocumentGenerationResponse>("/api/llm/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  analyzeMultimodal: (data: Types.MultimodalAnalysisRequest): Promise<any> =>
    fetchAPI<any>("/api/llm/analyze-multimodal", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  summarizeChat: (data: Record<string, any>): Promise<any> =>
    fetchAPI<any>(`/api/llm/chat/summarize`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  chatWithDocument: (
    data: Types.ChatDocumentRequest,
  ): Promise<Types.DocumentChatResponse> =>
    fetchAPI<Types.DocumentChatResponse>("/api/llm/chat/document", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  chatWithDocs: (
    documentId: string,
    user_input: string,
  ): Promise<Types.DocumentChatResponse> =>
    fetchAPI<Types.DocumentChatResponse>("/api/llm/chat/document", {
      method: "POST",
      body: JSON.stringify({ document_id: documentId, user_input }),
    }),
  chatRAGAgent: (
    data: Types.ChatRAGRequest,
  ): Promise<Types.DocumentChatResponse> =>
    fetchAPI<Types.DocumentChatResponse>("/api/llm/rag-agent", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getRagHealth: (): Promise<any> =>
    fetchAPI<any>("/api/llm/rag-health"),


  // --- INDUSTRIES & TEMPLATES ---
  getIndustries: (search?: string): Promise<Types.IndustryResponse[]> => {
    let url = "/api/industries";
    if (search) url += `?search=${search}`;
    return fetchAPI<Types.IndustryResponse[]>(url, { skipAuth: true });
  },
  getIndustry: (id: string): Promise<Types.IndustryResponse> =>
    fetchAPI<Types.IndustryResponse>(`/api/industries/${id}`, {
      skipAuth: true,
    }),
  createIndustry: (
    data: Types.IndustryCreate,
  ): Promise<Types.IndustryResponse> =>
    fetchAPI<Types.IndustryResponse>("/api/industries", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateIndustry: (
    id: string,
    data: Types.IndustryUpdate,
  ): Promise<Types.IndustryResponse> =>
    fetchAPI<Types.IndustryResponse>(`/api/industries/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteIndustry: (id: string): Promise<null> =>
    fetchAPI<null>(`/api/industries/${id}`, { method: "DELETE" }),
  getTemplatesByIndustry: (
    industryId: string,
    tenantId?: string,
  ): Promise<Types.TemplateResponse[]> => {
    let url = `/api/industries/${industryId}/templates`;
    if (tenantId) url += `?tenant_id=${tenantId}`;
    return fetchAPI<Types.TemplateResponse[]>(url);
  },

  // --- CATEGORIES & SUBCATEGORIES ---
  getCategories: (limit: number = 100, offset: number = 0, search?: string): Promise<Types.CategoryResponse[]> => {
    let url = "/api/categories";
    const p = new URLSearchParams();
    p.append("limit", limit.toString());
    p.append("offset", offset.toString());
    if (search) p.append("search", search);
    url += `?${p.toString()}`;
    return fetchAPI<Types.CategoryResponse[]>(url);
  },
  getCategory: (id: string): Promise<Types.CategoryResponse> => fetchAPI<Types.CategoryResponse>(`/api/categories/${id}`),
  createCategory: (data: Types.CategoryCreate): Promise<Types.CategoryResponse> => 
    fetchAPI<Types.CategoryResponse>("/api/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id: string, data: Types.CategoryUpdate): Promise<Types.CategoryResponse> => 
    fetchAPI<Types.CategoryResponse>(`/api/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCategory: (id: string): Promise<null> =>
    fetchAPI<null>(`/api/categories/${id}`, { method: "DELETE" }),

  getSubcategories: (limit: number = 100, offset: number = 0, search?: string): Promise<Types.SubcategoryResponse[]> => {
    let url = "/api/subcategories";
    const p = new URLSearchParams();
    p.append("limit", limit.toString());
    p.append("offset", offset.toString());
    if (search) p.append("search", search);
    url += `?${p.toString()}`;
    return fetchAPI<Types.SubcategoryResponse[]>(url);
  },
  getSubcategory: (id: string): Promise<Types.SubcategoryResponse> => fetchAPI<Types.SubcategoryResponse>(`/api/subcategories/${id}`),
  createSubcategory: (data: Types.SubcategoryCreate): Promise<Types.SubcategoryResponse> => 
    fetchAPI<Types.SubcategoryResponse>("/api/subcategories", { method: "POST", body: JSON.stringify(data) }),
  updateSubcategory: (id: string, data: Types.SubcategoryUpdate): Promise<Types.SubcategoryResponse> => 
    fetchAPI<Types.SubcategoryResponse>(`/api/subcategories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSubcategory: (id: string): Promise<null> =>
    fetchAPI<null>(`/api/subcategories/${id}`, { method: "DELETE" }),

  // --- CATEGORIES ---
  // Note: Categories and Subcategories might be part of Industry endpoints or separate if they exist
  // Based on OpenAPI, they seem to be managed via verticals/industries but let's keep them if they exist in backend

  // --- TEMPLATES ---
  getPublicTemplates: (
    search?: string,
    limit: number = 20,
    offset: number = 0,
    industryId?: string,
    categoryId?: string,
    subcategoryId?: string,
  ): Promise<Types.TemplateResponse[]> => {
    let url = "/api/templates/public";
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    if (industryId) params.append("industry_id", industryId);
    if (categoryId) params.append("category_id", categoryId);
    if (subcategoryId) params.append("subcategory_id", subcategoryId);
    const q = params.toString();
    if (q) url += `?${q}`;
    return fetchAPI<Types.TemplateResponse[]>(url, { skipAuth: true });
  },
  getMyTemplates: (): Promise<Types.TemplateResponse[]> =>
    fetchAPI<Types.TemplateResponse[]>("/api/templates/my"),
  aiTemplateBuilder: (
    industryId: string,
    categoryId: string,
    subcategoryId?: string,
  ): Promise<Types.TemplateResponse[]> => {
    let url = `/api/templates/ai-builder?industry_id=${industryId}&category_id=${categoryId}`;
    if (subcategoryId) url += `&subcategory_id=${subcategoryId}`;
    return fetchAPI<Types.TemplateResponse[]>(url, { method: "POST" });
  },
  createTemplate: (
    data: Types.TemplateCreate,
  ): Promise<Types.TemplateResponse> =>
    fetchAPI<Types.TemplateResponse>("/api/templates", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  generateDocumentFromTemplate: (
    templateId: string,
    data: Types.TemplateGenerateRequest,
  ): Promise<any> =>
    fetchAPI<any>(`/api/templates/${templateId}/generate`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getTemplate: (id: string): Promise<Types.TemplateResponse> =>
    fetchAPI<Types.TemplateResponse>(`/api/templates/${id}`),
  updateTemplate: (
    id: string,
    data: Types.TemplateUpdate,
  ): Promise<Types.TemplateResponse> =>
    fetchAPI<Types.TemplateResponse>(`/api/templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteTemplate: (id: string): Promise<any> =>
    fetchAPI<any>(`/api/templates/${id}`, { method: "DELETE" }),

  // --- REPORTS ---
  getMyReports: (
    search?: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Types.GeneratedReportResponse[]> => {
    let url = "/api/reports";
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    const q = params.toString();
    if (q) url += `?${q}`;
    return fetchAPI<Types.GeneratedReportResponse[]>(url);
  },
  getReport: (id: string): Promise<Types.GeneratedReportResponse> =>
    fetchAPI<Types.GeneratedReportResponse>(`/api/reports/${id}`),
  analyzeReport: (
    data: Types.Body_analyze_document_api_reports_analyze_post,
  ): Promise<Types.GeneratedReportResponse> =>
    fetchAPI<Types.GeneratedReportResponse>("/api/reports/analyze", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getReportVersions: (
    reportId: string,
  ): Promise<Types.GeneratedReportResponse[]> =>
    fetchAPI<Types.GeneratedReportResponse[]>(
      `/api/reports/${reportId}/versions`,
    ),

  // --- BILLING & PLANS ---
  getPlans: (): Promise<Types.PlanResponse[]> =>
    fetchAPI<Types.PlanResponse[]>("/api/plans", { skipAuth: true }),
  createPlan: (data: Types.PlanCreate): Promise<Types.PlanResponse> =>
    fetchAPI<Types.PlanResponse>("/api/plans", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updatePlan: (
    planId: string,
    data: Types.PlanUpdate,
  ): Promise<Types.PlanResponse> =>
    fetchAPI<Types.PlanResponse>(`/api/plans/${planId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deletePlan: (planId: string): Promise<null> =>
    fetchAPI<null>(`/api/plans/${planId}`, { method: "DELETE" }),
  getSubscription: (): Promise<Types.SubscriptionResponse> =>
    fetchAPI<Types.SubscriptionResponse>("/api/billing/subscription"),
  getInvoices: (
    search?: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Types.InvoiceResponse[]> => {
    let url = "/api/billing/invoices";
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    const q = params.toString();
    if (q) url += `?${q}`;
    return fetchAPI<Types.InvoiceResponse[]>(url);
  },
  getBillingHistory: (
    search?: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Types.InvoiceResponse[]> => {
    let url = "/api/billing/history";
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    const q = params.toString();
    if (q) url += `?${q}`;
    return fetchAPI<Types.InvoiceResponse[]>(url);
  },
  syncPlansWithStripe: (): Promise<Types.StripeSyncResponse> => 
    fetchAPI<Types.StripeSyncResponse>("/api/billing/plans/sync-stripe", { method: "POST" }),
  syncCheckoutSession: (sessionId: string): Promise<any> => 
    fetchAPI<any>("/api/billing/sync-session", { method: "POST", body: JSON.stringify({ session_id: sessionId }) }),
  createCheckout: (
    data: Types.CheckoutSessionRequest,
  ): Promise<Types.CheckoutSessionResponse> =>
    fetchAPI<Types.CheckoutSessionResponse>("/api/billing/checkout", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createAddonCheckout: (
    data: { addon_type: string, quantity: number, success_url: string, cancel_url: string },
  ): Promise<Types.CheckoutSessionResponse> =>
    fetchAPI<Types.CheckoutSessionResponse>("/api/billing/checkout-addon", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  // --- METERING ---
  getUsageMetering: (): Promise<Types.UsageSummary[]> =>
    fetchAPI<Types.UsageSummary[]>("/api/metering/summary"),
  getUsageLogsDetailed: (metric?: string, limit: number = 100, offset: number = 0): Promise<Types.UsageLogResponse[]> => {
    let url = "/api/metering/logs";
    const p = new URLSearchParams();
    if (metric) p.append("metric_name", metric);
    p.append("limit", limit.toString());
    p.append("offset", offset.toString());
    url += `?${p.toString()}`;
    return fetchAPI<Types.UsageLogResponse[]>(url);
  },
  recordUsage: (metric: string, qty: number = 1): Promise<any> => 
    fetchAPI<any>(`/api/metering/record?metric_name=${metric}&quantity=${qty}`, { method: "POST" }),
  getUsageLogs: (
    search?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Types.UsageLogResponse[]> => {
    let url = "/api/logs/usage";
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    const q = params.toString();
    if (q) url += `?${q}`;
    return fetchAPI<Types.UsageLogResponse[]>(url);
  },
  logUsage: (metric: string, quantity: number): Promise<any> =>
    fetchAPI<any>(`/api/logs/usage?metric=${metric}&quantity=${quantity}`, {
      method: "POST",
    }),
  getUsageSummary: (): Promise<Types.UsageSummary[]> =>
    fetchAPI<Types.UsageSummary[]>("/api/logs/usage/summary"),
  getAuditLogs: (
    search?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Types.AuditLogResponse[]> => {
    let url = "/api/logs/audit";
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    const q = params.toString();
    if (q) url += `?${q}`;
    return fetchAPI<Types.AuditLogResponse[]>(url);
  },
  createAuditLog: (
    action: string,
    resType: string,
    resId?: string,
    details?: Record<string, any>,
  ): Promise<any> => {
    let url = `/api/logs/audit?action=${action}&resource_type=${resType}`;
    if (resId) url += `&resource_id=${resId}`;
    return fetchAPI<any>(url, {
      method: "POST",
      body: details ? JSON.stringify(details) : undefined,
    });
  },

  // --- NOTIFICATIONS ---
  getNotifications: (
    unreadOnly: boolean = false,
    token?: string,
  ): Promise<Types.NotificationResponse[]> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token.trim()}`;
    }
    return fetchAPI<Types.NotificationResponse[]>(
      `/api/notifications?unread_only=${unreadOnly}`,
      { headers },
    );
  },
  markNotificationRead: (id: string): Promise<any> =>
    fetchAPI<any>(`/api/notifications/${id}/read`, { method: "POST" }),
  markAllNotificationsRead: (): Promise<any> =>
    fetchAPI<any>("/api/notifications/read-all", { method: "POST" }),
  deleteNotification: (id: string): Promise<any> =>
    fetchAPI<any>(`/api/notifications/${id}`, { method: "DELETE" }),
  
  // --- INTEGRATIONS ---
  getGoogleAuthUrl: (): Promise<Types.AuthUrlResponse> => fetchAPI<Types.AuthUrlResponse>("/api/integrations/google/auth-url"),
  googleAuthCallback: (data: Types.CallbackRequest): Promise<any> => fetchAPI<any>("/api/integrations/google/callback", { method: "POST", body: JSON.stringify(data) }),
  syncGoogleDrive: (): Promise<any> => fetchAPI<any>("/api/integrations/google/sync", { method: "POST" }),
  getGoogleStatus: (): Promise<any> => fetchAPI<any>("/api/integrations/google/status"),
  listGoogleFiles: (): Promise<Types.GoogleFile[]> => fetchAPI<Types.GoogleFile[]>("/api/integrations/google/files"),

  // --- ADMIN ---
  getAdminMetrics: (): Promise<Types.AdminMetrics> =>
    fetchAPI<Types.AdminMetrics>("/api/admin/metrics"),
  getAdminFailedPayments: (
    limit: number = 50,
    offset: number = 0,
  ): Promise<Types.InvoiceResponse[]> =>
    fetchAPI<Types.InvoiceResponse[]>(
      `/api/admin/billing/failed?limit=${limit}&offset=${offset}`,
    ),
  listAllTenants: (
    search?: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Types.TenantResponse[]> => {
    let url = "/api/admin/tenants";
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    const q = params.toString();
    if (q) url += `?${q}`;
    return fetchAPI<Types.TenantResponse[]>(url);
  },
  suspendTenant: (tenantId: string): Promise<any> =>
    fetchAPI<any>(`/api/admin/tenants/${tenantId}/suspend`, { method: "POST" }),

  // --- USERS MANAGEMENT ---
  getUsers: (): Promise<Types.UserResponse[]> =>
    fetchAPI<Types.UserResponse[]>("/api/users"),

  // --- ROLES ---
  getTenantRoles: (): Promise<Types.RoleResponse[]> =>
    fetchAPI<Types.RoleResponse[]>("/api/roles"),
  createRole: (data: Types.RoleCreate): Promise<Types.RoleResponse> =>
    fetchAPI<Types.RoleResponse>("/api/roles", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateRole: (
    id: string,
    data: Types.RoleUpdate,
  ): Promise<Types.RoleResponse> =>
    fetchAPI<Types.RoleResponse>(`/api/roles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteRole: (id: string): Promise<null> =>
    fetchAPI<null>(`/api/roles/${id}`, { method: "DELETE" }),
};

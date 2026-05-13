/**
 * Automatically regenerated types from openapi.json
 */

export type TenantTypeSchema = 'individual' | 'enterprise';

export interface AuditLogResponse {
  log_id: string;
  action: string;
  resource_type?: string | any | null;
  resource_id?: string | any | null;
  details?: Record<string, any> | any | null;
  created_on: string;
  updated_on: string;
  timestamp: string;
}

export interface AuthUrlResponse {
  url: string;
  auth_url?: string;
}

export interface Body_analyze_document_api_reports_analyze_post {
  document_id: string;
  template_id: string;
  prompt?: string;
}

export interface Body_login_for_access_token_api_users_login_post {
  grant_type?: string | any | null;
  username: string;
  password: string;
  scope?: string;
  client_id?: string | any | null;
  client_secret?: string | any | null;
}

export interface Body_upload_document_api_documents_upload_post {
  file: string;
}

export interface CallbackRequest {
  code: string;
  state?: string | any | null;
}

export interface CategoryCreate {
  industry_id: string;
  name: string;
  description?: string | any | null;
}

export interface CategoryResponse {
  industry_id: string;
  name: string;
  description?: string | any | null;
  category_id: string;
  subcategories?: SubcategoryResponse[];
}

export interface CategoryUpdate {
  industry_id?: string | any | null;
  name?: string | any | null;
  description?: string | any | null;
}

export interface ChatDocumentRequest {
  document_id: string;
  user_input: string;
  history?: ChatMessage[] | any | null;
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatRAGRequest {
  user_input: string;
  history?: ChatMessage[] | any | null;
}

export interface CheckoutSessionRequest {
  plan_id: string;
  provider: string;
  interval?: string;
  success_url: string;
  cancel_url: string;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
  session_id?: string | any | null;
}

export interface DocumentChatResponse {
  response: string;
  answer?: string;
  suggestions?: DocumentChatSuggestion[];
  chart_data?: Record<string, any> | any | null;
}

export interface DocumentChatSuggestion {
  label: string;
  type?: string;
}

export interface DocumentContentResponse {
  document_id: string;
  version_number: number;
  content: string;
  created_on?: string | any | null;
}

export interface DocumentContentUpdate {
  content: string;
}

export interface DocumentCreateFromTemplate {
  filename: string;
  template_id: string;
  folder_id?: string | any | null;
  template_data?: Record<string, any> | any | null;
}

export interface DocumentCreateManual {
  filename: string;
  content: string;
  folder_id?: string | any | null;
  industry_id?: string | any | null;
  category_id?: string | any | null;
  subcategory_id?: string | any | null;
}

export interface DocumentGenerationRequest {
  template_id?: string | any | null;
  prompt: string;
  tenant_id?: string | any | null;
  industry_id?: string | any | null;
  category_id?: string | any | null;
  subcategory_id?: string | any | null;
  industry_context?: string | any | null;
}

export interface DocumentGenerationResponse {
  content: string;
  template_id?: string | any | null;
  document_url?: string | any | null;
}

export interface DocumentImageResponse {
  image_id: string;
  image_url: string;
  created_on?: string | any | null;
}

export interface DocumentListResponse {
  document_id: string;
  filename: string;
  file_url: string;
  industry_id?: string | any | null;
  category_id?: string | any | null;
  subcategory_id?: string | any | null;
  folder_id?: string | any | null;
  industry_name?: string | any | null;
  category_name?: string | any | null;
  subcategory_name?: string | any | null;
  google_file_id?: string | any | null;
  google_last_modified?: string | any | null;
  status: string;
  file_size?: number | any | null;
  file_type?: string | any | null;
  page_count?: number | any | null;
  created_on?: string | any | null;
}

export interface DocumentResponse {
  document_id: string;
  filename: string;
  file_url: string;
  industry_id?: string | any | null;
  category_id?: string | any | null;
  subcategory_id?: string | any | null;
  folder_id?: string | any | null;
  industry_name?: string | any | null;
  category_name?: string | any | null;
  subcategory_name?: string | any | null;
  google_file_id?: string | any | null;
  google_last_modified?: string | any | null;
  status: string;
  file_size?: number | any | null;
  file_type?: string | any | null;
  page_count?: number | any | null;
  metadata?: Record<string, any> | any | null;
  created_on?: string | any | null;
  versions?: DocumentVersionResponse[] | any | null;
  images?: DocumentImageResponse[] | any | null;
}

export interface DocumentVersionResponse {
  version_id: string;
  version_number: number;
  content: string;
  created_on?: string | any | null;
  created_by?: string | any | null;
}

export interface GeneratedReportResponse {
  report_id: string;
  parent_id?: string | any | null;
  version?: number | any | null;
  original_prompt?: string | any | null;
  title: string;
  content_markdown: string;
  structured_data?: Record<string, any> | any | null;
  chart_data?: Record<string, any> | any | null;
  tokens_consumed?: number | any | null;
  created_on?: string | any | null;
}

export interface GoogleAuthRequest {
  code?: string | any | null;
  email?: string | any | null;
  first_name?: string | any | null;
  last_name?: string | any | null;
  google_id?: string | any | null;
  image_url?: string | any | null;
  tenant_id?: string | any | null;
}

export interface GoogleDocImportRequest {
  url?: string;
  google_doc_id?: string;
  mime_type?: string;
  filename?: string | any | null;
  folder_id?: string | any | null;
}

export interface GoogleFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string | any | null;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface IndustryCreate {
  name: string;
  description?: string | any | null;
  icon?: string | any | null;
}

export interface IndustryDetectionRequest {
  file_content: string;
  document_id?: string | any | null;
}

export interface IndustryDetectionResponse {
  industry_id?: string | any | null;
  industry_name?: string | any | null;
  category_id?: string | any | null;
  category_name?: string | any | null;
  subcategory_id?: string | any | null;
  subcategory_name?: string | any | null;
  confidence?: number;
}

export interface IndustryResponse {
  name: string;
  description?: string | any | null;
  icon?: string | any | null;
  industry_id: string;
  categories?: CategoryResponse[];
}

export interface IndustryUpdate {
  name?: string | any | null;
  description?: string | any | null;
  icon?: string | any | null;
}

export interface InvoiceResponse {
  invoice_id: string;
  amount: number;
  currency: string;
  status: string;
  hosted_invoice_url?: string | any | null;
  created_on: string;
}

export interface MultimodalAnalysisRequest {
  text: string;
  image_urls: string[];
}

export interface NotificationResponse {
  notification_id: string;
  title: string;
  message: string;
  type: string;
  is_read?: boolean | any | null;
  created_on?: string | any | null;
}

export interface PaginatedDocumentContentResponse {
  document_id: string;
  version_number: number;
  content: string;
  content_html?: string | any | null;
  rich_content?: any | any | null;
  page: number;
  page_size: number;
  total_pages: number;
  total_characters: number;
  created_on?: string | any | null;
}

export interface PlanCreate {
  name: string;
  description?: string | any | null;
  price: number;
  currency?: string;
  limits: Record<string, any>;
  is_active?: boolean | any | null;
  stripe_monthly_price_id?: string | any | null;
  stripe_yearly_price_id?: string | any | null;
  paypal_plan_id?: string | any | null;
}

export interface PlanResponse {
  name: string;
  description?: string | any | null;
  price: number;
  currency?: string;
  limits: Record<string, any>;
  is_active?: boolean | any | null;
  plan_id: string;
  stripe_monthly_price_id?: string | any | null;
  stripe_yearly_price_id?: string | any | null;
  paypal_plan_id?: string | any | null;
}

export interface PlanUpdate {
  name?: string | any | null;
  description?: string | any | null;
  price?: number | any | null;
  limits?: Record<string, any> | any | null;
  is_active?: boolean | any | null;
  stripe_monthly_price_id?: string | any | null;
  stripe_yearly_price_id?: string | any | null;
  paypal_plan_id?: string | any | null;
}

export interface RoleCreate {
  name: string;
  description?: string | any | null;
  is_system?: boolean | any | null;
  permissions?: Record<string, any> | any | null;
}

export interface RoleResponse {
  name: string;
  description?: string | any | null;
  is_system?: boolean | any | null;
  permissions?: Record<string, any> | any | null;
  role_id: string;
  tenant_id?: string | any | null;
  is_active?: boolean | any | null;
  created_on?: string | any | null;
  updated_on?: string | any | null;
}

export interface RoleUpdate {
  name?: string | any | null;
  description?: string | any | null;
  is_system?: boolean | any | null;
  permissions?: Record<string, any> | any | null;
}

export interface StripeSyncRequest {
  session_id: string;
}

export interface StripeSyncResponse {
  synced_plans: number;
  created_products: number;
  created_prices: number;
  details: string[];
}

export interface SubcategoryCreate {
  category_id: string;
  name: string;
  description?: string | any | null;
  prompt?: string | any | null;
}

export interface SubcategoryResponse {
  category_id: string;
  name: string;
  description?: string | any | null;
  prompt?: string | any | null;
  subcategory_id: string;
}

export interface SubcategoryUpdate {
  category_id?: string | any | null;
  name?: string | any | null;
  description?: string | any | null;
  prompt?: string | any | null;
}

export interface SubscriptionResponse {
  subscription_id: string;
  status: string;
  current_period_end: string;
  plan: PlanResponse;
}

export interface TemplateCreate {
  industry_id?: string | any | null;
  category_id?: string | any | null;
  subcategory_id?: string | any | null;
  template_name?: string | any | null;
  description?: string | any | null;
  template_schema?: Record<string, any> | any | null;
  document_type?: string | any | null;
  html_content?: string | any | null;
  category?: string | any | null;
  subcategory?: string | any | null;
  title?: string | any | null;
  subtitle?: string | any | null;
  footer?: string | any | null;
  header_image?: string | any | null;
  config?: Record<string, any> | any | null;
  is_public?: boolean;
  prompt?: string | any | null;
}

export interface TemplateGenerateRequest {
  data?: Record<string, any> | any | null;
  csv_data?: string | any | null;
  sections?: Record<string, any> | any | null;
  filename?: string | any | null;
  output_format?: string;
}

export interface TemplateResponse {
  template_id: string;
  tenant_id?: string | any | null;
  user_id?: string | any | null;
  industry_id?: string | any | null;
  category_id?: string | any | null;
  subcategory_id?: string | any | null;
  template_name: string;
  description?: string | any | null;
  template_schema?: Record<string, any> | any | null;
  document_type?: string | any | null;
  html_content?: string | any | null;
  category?: string | any | null;
  subcategory?: string | any | null;
  title?: string | any | null;
  subtitle?: string | any | null;
  footer?: string | any | null;
  header_image?: string | any | null;
  config?: Record<string, any> | any | null;
  is_public?: boolean;
}

export interface TemplateUpdate {
  industry_id?: string | any | null;
  category_id?: string | any | null;
  subcategory_id?: string | any | null;
  template_name?: string | any | null;
  description?: string | any | null;
  template_schema?: Record<string, any> | any | null;
  document_type?: string | any | null;
  html_content?: string | any | null;
  title?: string | any | null;
  subtitle?: string | any | null;
  footer?: string | any | null;
  header_image?: string | any | null;
  config?: Record<string, any> | any | null;
  is_public?: boolean | any | null;
}

export interface TenantBase {
  name: string;
  type: TenantTypeSchema;
  slug: string;
  org_name?: string | any | null;
  address?: string | any | null;
}

export interface TenantResponse {
  name: string;
  type: TenantTypeSchema;
  slug: string;
  org_name?: string | any | null;
  address?: string | any | null;
  tenant_id: string;
  is_active?: boolean | any | null;
  created_on?: string | any | null;
  subscription_status?: string | any | null;
  plan_name?: string | any | null;
}

export interface Token {
  access_token: string;
  token_type?: string;
  expires_at: string;
  expires_in: number;
  user: UserResponse;
}

export interface UsageLogResponse {
  metric_name: string;
  quantity: number;
  created_on: string;
}

export interface UsageSummary {
  metric_name: string;
  total_quantity: number;
  limit?: number | any | null;
  usage_percent?: number | any | null;
}

export interface UserCreate {
  email: string;
  first_name?: string | any | null;
  last_name?: string | any | null;
  provider?: string | any | null;
  password: string;
  tenant_id?: string | any | null;
  role_id?: string | any | null;
  tenant_type?: TenantTypeSchema | any | null;
  org_name?: string | any | null;
}

export interface UserRegisterResponse {
  user: UserResponse;
  access_token: string;
  token_type?: string;
}

export interface UserResponse {
  email: string;
  first_name?: string | any | null;
  last_name?: string | any | null;
  provider?: string | any | null;
  user_id: string;
  tenant_id: string;
  role_id?: string | any | null;
  role?: RoleResponse | any | null;
  role_name?: string | any | null;
  created_on?: string | any | null;
  is_active?: boolean | any | null;
}

export interface UserUpdate {
  first_name?: string | any | null;
  last_name?: string | any | null;
  password?: string | any | null;
  role_id?: string | any | null;
  is_active?: boolean | any | null;
}

export interface ValidationError {
  loc: string | number[];
  msg: string;
  type: string;
  input?: any;
  ctx?: any;
}

export interface AdminMetrics {
  total_tenants: number;
  total_users: number;
  total_documents: number;
  total_reports: number;
  total_mrr?: number;
  mrr_growth?: string;
  active_subscriptions?: number;
  sub_growth?: string;
  churn_rate?: number;
  churn_change?: string;
  revenue_summary: {
    daily: number;
    monthly: number;
    growth_percent: number;
  };
  system_health: {
    cpu_load: number;
    memory_usage: number;
    active_nodes: number;
  };
  plan_distribution?: {
    enterprise: number;
    professional: number;
    starter: number;
    [key: string]: number;
  };
}

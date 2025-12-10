/**
 * Test Data Module
 * Provides sample test data, constants, and environment-driven configuration
 */

/**
 * Environment configuration from process.env
 */
export const ENV = process.env.ENV || 'local';
export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
export const TIMEOUT = parseInt(process.env.TIMEOUT || '30000', 10);

/**
 * Environment-driven feature toggles
 * Use these to enable/disable features based on environment
 */
export const FEATURE_TOGGLES = {
  enableAuth: process.env.ENABLE_AUTH === 'true',
  enableApiMocking: process.env.ENABLE_API_MOCKING === 'true',
  skipSlowTests: process.env.SKIP_SLOW_TESTS === 'true',
  debugMode: process.env.DEBUG === 'true',
} as const;

/**
 * Test user credentials
 * PUBLIC_INTERFACE
 */
export const TEST_USERS = {
  admin: {
    username: process.env.TEST_ADMIN_USER || 'admin@test.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'Admin123!',
    role: 'admin',
  },
  standard: {
    username: process.env.TEST_USER || 'user@test.com',
    password: process.env.TEST_PASSWORD || 'User123!',
    role: 'user',
  },
  guest: {
    username: process.env.TEST_GUEST_USER || 'guest@test.com',
    password: process.env.TEST_GUEST_PASSWORD || 'Guest123!',
    role: 'guest',
  },
} as const;

/**
 * Sample test data for various scenarios
 * PUBLIC_INTERFACE
 */
export const TEST_DATA = {
  /**
   * Sample user registration data
   */
  registration: {
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!',
  },

  /**
   * Sample product data
   */
  products: [
    {
      id: 'prod-001',
      name: 'Sample Product 1',
      description: 'This is a test product',
      price: 99.99,
      category: 'Electronics',
    },
    {
      id: 'prod-002',
      name: 'Sample Product 2',
      description: 'Another test product',
      price: 149.99,
      category: 'Books',
    },
  ],

  /**
   * Sample form data
   */
  contactForm: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    subject: 'Test Inquiry',
    message: 'This is a test message for automated testing purposes.',
  },

  /**
   * Sample search queries
   */
  searchQueries: [
    'playwright',
    'automation',
    'testing',
    'javascript',
  ],
} as const;

/**
 * API endpoint paths
 * PUBLIC_INTERFACE
 */
export const API_ENDPOINTS = {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  register: '/api/auth/register',
  profile: '/api/user/profile',
  products: '/api/products',
  search: '/api/search',
} as const;

/**
 * Common selectors used across tests
 * PUBLIC_INTERFACE
 */
export const COMMON_SELECTORS = {
  // Form elements
  submitButton: 'button[type="submit"]',
  cancelButton: 'button[type="button"]',
  
  // Navigation
  navBar: 'nav, [role="navigation"]',
  homeLink: 'a[href="/"], a[href="#/"]',
  
  // Common UI elements
  loader: '.loader, .spinner, [data-testid="loader"]',
  errorMessage: '.error, .error-message, [role="alert"]',
  successMessage: '.success, .success-message, [data-testid="success"]',
  
  // Modal
  modal: '.modal, [role="dialog"]',
  modalClose: '.modal-close, [aria-label="Close"]',
} as const;

/**
 * Timeout configurations for different operations
 * PUBLIC_INTERFACE
 */
export const TIMEOUTS = {
  short: 5000,
  medium: 15000,
  long: 30000,
  veryLong: 60000,
  navigation: 10000,
  apiResponse: 20000,
} as const;

/**
 * Browser viewport configurations
 * PUBLIC_INTERFACE
 */
export const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  smallDesktop: { width: 1366, height: 768 },
} as const;

/**
 * Regular expressions for validation
 * PUBLIC_INTERFACE
 */
export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-()]+$/,
  url: /^https?:\/\/.+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
} as const;

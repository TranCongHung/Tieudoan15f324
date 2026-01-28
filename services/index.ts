// Unified API client that switches between Node.js and PHP based on environment
import { apiClient } from './api';
import { apiClientPHP } from './api_php';
import { shouldUsePHPBackend } from './config';

// Export the appropriate API client based on environment
export const api = shouldUsePHPBackend() ? apiClientPHP : apiClient;

// Re-export types for convenience
export * from './api';
export * from './api_php';
export * from './config';

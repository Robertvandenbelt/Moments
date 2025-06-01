// List of allowed origins for CORS
const allowedOrigins = [
  "https://getmoments.net",
  "https://www.getmoments.net",
  "http://localhost:3000" // for local dev
];

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // This will be dynamically set based on the request origin
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400' // 24 hours
};

// Helper function to get CORS headers for a specific origin
export function getCorsHeaders(origin: string | null) {
  if (!origin) return corsHeaders;
  
  const isAllowed = allowedOrigins.some(allowed => origin === allowed);
  if (!isAllowed) return corsHeaders;

  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': origin
  };
} 
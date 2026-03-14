export const rateLimitConfig = {
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
  },

  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
  },

  strict: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests
  },
};

export const API_PATHS = {
  auth: {
    signup: "/auth/signup",
    login: "/auth/login",
    me: "/auth/me",
    profile: "/auth/profile",
  },
  invoices: {
    all: "/invoices",
    create: "/invoices",
    get: (id) => `/invoices/${id}`,
    update: (id) => `/invoices/${id}`,
    delete: (id) => `/invoices/${id}`,
    pdf: (id) => `/invoices/pdf/${id}`,
  },
  ai: {
    generate: "/ai/generate",
    draft: "/ai/draft",
  },
};

const ACCESS_TOKEN_KEY = "crm_access_token";

export const authStorage = {
  getToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
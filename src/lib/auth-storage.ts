let accessToken: string | null = null;

export const authStorage = {
  clearAccessToken() {
    accessToken = null;
  },

  getAccessToken() {
    return accessToken;
  },

  setAccessToken(token: string | null) {
    accessToken = token;
  },
};

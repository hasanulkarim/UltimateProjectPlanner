/// <reference types="vite/client" />

interface Window {
  gapi: any;
  google: {
    accounts: {
      oauth2: {
        initTokenClient(config: {
          client_id: string;
          scope: string;
          callback: (response: any) => void;
        }): {
          requestAccessToken: (options?: { prompt?: string }) => void;
          callback: (response: any) => void;
        };
      };
    };
  };
}
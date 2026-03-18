const STATUS_REDIRECTS: Record<number, string> = {
  400: "/400",
  403: "/403",
  500: "/500",
  502: "/502",
  503: "/503",
};

let isInstalled = false;

function resolvePathFromRequest(input: RequestInfo | URL): string {
  const requestUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  try {
    return new URL(requestUrl, window.location.origin).pathname;
  } catch {
    return "";
  }
}

function isApiRequest(input: RequestInfo | URL): boolean {
  return resolvePathFromRequest(input).startsWith("/api/");
}

function redirectToErrorPage(status: number): void {
  const target = STATUS_REDIRECTS[status];
  if (!target) {
    return;
  }

  if (window.location.pathname !== target) {
    window.location.replace(target);
  }
}

export function installGlobalApiErrorHandling(): void {
  if (isInstalled) {
    return;
  }

  isInstalled = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      const response = await originalFetch(input, init);

      if (isApiRequest(input)) {
        redirectToErrorPage(response.status);
      }

      return response;
    } catch (error) {
      if (isApiRequest(input)) {
        redirectToErrorPage(503);
      }

      throw error;
    }
  };
}

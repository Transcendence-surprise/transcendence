const STATUS_REDIRECTS: Record<number, string> = {
  400: '/400',
  403: '/403',
  404: '/404',
  500: '/500',
  502: '/502',
  503: '/503',
};

let isInstalled = false;

function resolvePathFromRequest(input: RequestInfo | URL): string {
  const requestUrl =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

  try {
    return new URL(requestUrl, window.location.origin).pathname;
  } catch {
    return '';
  }
}

function shouldRedirectForRequest(input: RequestInfo | URL): boolean {
  const path = resolvePathFromRequest(input);
  return path.startsWith('/api/') && !path.endsWith('/health');
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

function shouldRedirectForStatus(status: number): boolean {
  return status in STATUS_REDIRECTS;
}

export function installGlobalApiErrorHandling(): void {
  if (isInstalled) {
    return;
  }

  const enableRedirects =
    import.meta.env.VITE_ENABLE_GLOBAL_API_ERROR_REDIRECTS !== 'false';

  if (!enableRedirects) {
    isInstalled = true;
    return;
  }

  isInstalled = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    try {
      const response = await originalFetch(input, init);

      if (shouldRedirectForRequest(input) && !response.ok) {
        if (shouldRedirectForStatus(response.status)) {
          redirectToErrorPage(response.status);
        }
      }

      return response;
    } catch (error) {
      if ((error as { name?: string })?.name === 'AbortError') {
        throw error;
      }

      if (shouldRedirectForRequest(input)) {
        redirectToErrorPage(503);
      }

      throw error;
    }
  };
}

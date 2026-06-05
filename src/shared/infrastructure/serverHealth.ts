const SERVER_HEALTH_TIMEOUT_MS = 3000;

const getServerHealthUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

  if (!apiUrl) {
    return '/api';
  }

  return `${apiUrl.replace(/\/$/, '')}/api`;
};

export async function checkServerHealth() {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => {
    controller.abort();
  }, SERVER_HEALTH_TIMEOUT_MS);

  try {
    const response = await fetch(getServerHealthUrl(), {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal,
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

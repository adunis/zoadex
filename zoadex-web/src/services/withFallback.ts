let mockModeCallback: ((value: boolean) => void) | null = null;

export function registerMockModeCallback(cb: (value: boolean) => void): void {
  mockModeCallback = cb;
}

export function unregisterMockModeCallback(): void {
  mockModeCallback = null;
}

function notifyMockMode(useMock: boolean): void {
  if (mockModeCallback) {
    mockModeCallback(useMock);
  }
}

export async function withFallback<T>(
  apiCall: () => Promise<T>,
  mockData: T,
): Promise<T> {
  try {
    const result = await apiCall();
    notifyMockMode(false);
    return result;
  } catch {
    notifyMockMode(true);
    return mockData;
  }
}

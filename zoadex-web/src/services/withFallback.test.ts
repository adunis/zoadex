import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withFallback, registerMockModeCallback, unregisterMockModeCallback } from './withFallback';

describe('withFallback', () => {
  let mockModeCallback: ReturnType<typeof vi.fn<(value: boolean) => void>>;

  beforeEach(() => {
    mockModeCallback = vi.fn<(value: boolean) => void>();
    registerMockModeCallback(mockModeCallback);
  });

  afterEach(() => {
    unregisterMockModeCallback();
  });

  it('returns API result on success', async () => {
    const apiResult = { data: 'from API' };

    const result = await withFallback(async () => apiResult, { data: 'fallback' });

    expect(result).toEqual(apiResult);
  });

  it('calls mockModeCallback with false on success', async () => {
    await withFallback(async () => 'success', 'fallback');

    expect(mockModeCallback).toHaveBeenCalledWith(false);
  });

  it('returns mock data on API failure', async () => {
    const mockData = { data: 'fallback' };

    const result = await withFallback(async () => {
      throw new Error('Network Error');
    }, mockData);

    expect(result).toEqual(mockData);
  });

  it('calls mockModeCallback with true on failure', async () => {
    await withFallback(async () => {
      throw new Error('fail');
    }, 'fallback');

    expect(mockModeCallback).toHaveBeenCalledWith(true);
  });

  it('does not crash when no callback is registered', async () => {
    unregisterMockModeCallback();

    const result = await withFallback(async () => 'ok', 'fallback');

    expect(result).toBe('ok');
  });
});

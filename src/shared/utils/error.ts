/**
 * API 에러 객체의 표준 구조
 */
export interface ApiError {
  status: number;
  message?: string;
  data?: unknown;
}

/**
 * 객체가 ApiError 형식을 따르는지 확인하는 Type Guard
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as ApiError).status === 'number'
  );
}

/**
 * 에러 메시지를 안전하게 추출하는 유틸리티
 */
export function getErrorMessage(error: unknown, fallback = '알 수 없는 오류가 발생했습니다.'): string {
  if (isApiError(error) && error.message) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

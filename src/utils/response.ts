export function successResponse<T>(data: T, message: string = 'Success') {
  return {
    data,
    message,
  };
}

export function errorResponse(message: string, code: string, details?: any) {
  return {
    message,
    error: {
      code,
      details: details || [],
    },
  };
}

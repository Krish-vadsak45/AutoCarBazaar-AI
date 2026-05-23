import axios from 'axios';

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function getAxiosErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data;

    if (typeof responseMessage === 'string') {
      return responseMessage;
    }

    if (
      responseMessage &&
      typeof responseMessage === 'object' &&
      'message' in responseMessage &&
      typeof responseMessage.message === 'string'
    ) {
      return responseMessage.message;
    }

    if (
      responseMessage &&
      typeof responseMessage === 'object' &&
      'error' in responseMessage &&
      typeof responseMessage.error === 'string'
    ) {
      return responseMessage.error;
    }

    if (typeof error.message === 'string' && error.message.length > 0) {
      return error.message;
    }
  }

  return getErrorMessage(error, fallback);
}

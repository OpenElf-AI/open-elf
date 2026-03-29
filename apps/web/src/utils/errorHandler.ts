export interface ErrorInfo {
  message: string;
  type: 'user' | 'system' | 'network' | 'unknown';
  actionable?: {
    label: string;
    action: () => void;
  };
}

export class AppError extends Error {
  type: ErrorInfo['type'];
  actionable?: ErrorInfo['actionable'];

  constructor(
    message: string,
    type: ErrorInfo['type'] = 'unknown',
    actionable?: ErrorInfo['actionable']
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.actionable = actionable;
  }
}

export const parseError = (error: unknown): ErrorInfo => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      type: error.type,
      actionable: error.actionable,
    };
  }

  if (error instanceof Error) {
    const message = error.message;

    if (message.includes('fetch') || message.includes('network') || message.includes('连接')) {
      return {
        message: '网络连接失败，请检查网络设置',
        type: 'network',
      };
    }

    if (message.includes('API key') || message.includes('API Key') || message.includes('配置')) {
      return {
        message: message,
        type: 'user',
        actionable: {
          label: '去配置',
          action: () => {
            window.location.hash = '#llm-config';
          },
        },
      };
    }

    if (message.includes('体验次数') || message.includes('购买')) {
      return {
        message: message,
        type: 'user',
      };
    }

    return {
      message: message,
      type: 'system',
    };
  }

  return {
    message: '发生未知错误，请稍后重试',
    type: 'unknown',
  };
};

export const createUserError = (message: string, actionable?: ErrorInfo['actionable']) => {
  return new AppError(message, 'user', actionable);
};

export const createNetworkError = (message: string = '网络连接失败，请检查网络设置') => {
  return new AppError(message, 'network');
};

export const createSystemError = (message: string = '系统错误，请稍后重试') => {
  return new AppError(message, 'system');
};

export const logError = (error: unknown, context?: string) => {
  console.error(`[Error${context ? `: ${context}` : ''}]`, error);

  if (import.meta.env.PROD) {
    // TODO: 在生产环境中发送错误到监控服务
    // sendErrorToMonitoring(error, context);
  }
};

export const measurePerformance = async <T>(
  fn: () => Promise<T>,
  metricName: string
): Promise<T> => {
  const startTime = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    console.log(`[Performance] ${metricName}: ${duration.toFixed(2)}ms`);

    if (import.meta.env.PROD) {
      // TODO: 在生产环境中发送性能指标到监控服务
      // sendPerformanceMetric(metricName, duration);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logError(error, `${metricName} (failed after ${duration.toFixed(2)}ms)`);
    throw error;
  }
};

export const captureException = (error: unknown, extra?: Record<string, unknown>) => {
  const errorInfo = parseError(error);
  console.error('[Exception Captured]', { ...errorInfo, extra });

  if (import.meta.env.PROD) {
    // TODO: 在生产环境中发送异常到监控服务
    // sendExceptionToSentry(errorInfo, extra);
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('error', event => {
    logError(event.error, 'Global Error');
    captureException(event.error, {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', event => {
    logError(event.reason, 'Unhandled Promise Rejection');
    captureException(event.reason, { type: 'unhandledrejection' });
  });
}

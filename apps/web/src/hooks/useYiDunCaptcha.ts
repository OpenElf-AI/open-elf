import { useState, useRef, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    initNECaptcha?: (config: any, callback?: (instance: any) => void) => void;
  }
}

interface YiDunCaptchaOptions {
  elementId: string;
  captchaId: string;
  mode?: 'float' | 'popup' | 'bind';
  width?: number | string;
  lang?: string;
  mock?: boolean;
}

export const useYiDunCaptcha = (options: YiDunCaptchaOptions) => {
  const [isReady, setIsReady] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const captchaInstanceRef = useRef<any>(null);
  const verifyPromiseRef = useRef<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  } | null>(null);

  const initCaptcha = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (options.mock) {
      setIsReady(true);
      captchaInstanceRef.current = {
        verify: () => {
          setTimeout(() => {
            setIsVerifying(false);
            verifyPromiseRef.current?.resolve('mock_captcha_token_' + Date.now());
            verifyPromiseRef.current = null;
          }, 500);
        },
        refresh: () => {},
      };
      return;
    }

    const tryInit = () => {
      if (!window.initNECaptcha) {
        setTimeout(tryInit, 100);
        return;
      }

      const config = {
        element: options.elementId,
        captchaId: options.captchaId,
        mode: options.mode || 'popup',
        width: options.width || 'auto',
        lang: options.lang || 'zh-CN',
        onReady: () => {
          setIsReady(true);
        },
        onVerify: (err: any, data: any) => {
          setIsVerifying(false);
          if (err) {
            console.error('验证码验证失败:', err);
            verifyPromiseRef.current?.reject(err);
          } else {
            verifyPromiseRef.current?.resolve(data.validate);
          }
          verifyPromiseRef.current = null;
        },
        onClose: () => {
          setIsVerifying(false);
          if (verifyPromiseRef.current) {
            verifyPromiseRef.current.reject(new Error('验证取消'));
            verifyPromiseRef.current = null;
          }
        },
      };

      window.initNECaptcha(config, (instance) => {
        captchaInstanceRef.current = instance;
      });
    };

    tryInit();
  }, [options]);

  const verify = useCallback(() => {
    if (!captchaInstanceRef.current) {
      return Promise.reject(new Error('验证码实例未初始化'));
    }

    setIsVerifying(true);
    
    return new Promise<string>((resolve, reject) => {
      verifyPromiseRef.current = { resolve, reject };
      
      if (options.mock) {
        captchaInstanceRef.current.verify();
      } else if (captchaInstanceRef.current?.verify) {
        captchaInstanceRef.current.verify();
      } else if (captchaInstanceRef.current?.popUp) {
        captchaInstanceRef.current.popUp();
      }
    });
  }, [options.mock]);

  const reset = useCallback(() => {
    if (captchaInstanceRef.current?.refresh) {
      captchaInstanceRef.current.refresh();
    }
    setIsVerifying(false);
    verifyPromiseRef.current = null;
  }, []);

  useEffect(() => {
    initCaptcha();

    return () => {
      captchaInstanceRef.current = null;
      verifyPromiseRef.current = null;
    };
  }, [initCaptcha]);

  return {
    isReady,
    isVerifying,
    verify,
    reset,
  };
};

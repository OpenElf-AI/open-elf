import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '../store';
import { useAppStore } from '../store';
import { useToast } from '../components/Toast';
import { initApi, getApi, isMockMode } from '../api';
import { useYiDunCaptcha } from '../hooks/useYiDunCaptcha';

const LoginPage: React.FC = () => {
  const { login } = useUserStore();
  const { setCurrentView } = useAppStore();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [apiInitialized, setApiInitialized] = useState(false);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    const initializeApi = async () => {
      await initApi();
      setApiInitialized(true);
      setUsingMock(isMockMode());
    };
    initializeApi();
  }, []);

  const api = getApi();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  const sendCodeMutation = useMutation({
    mutationFn: (captchaToken: string) =>
      api.auth.sendCode(phone, mode === 'login' ? 'login' : 'register', captchaToken),
    onSuccess: () => {
      showToast('验证码已发送', 'success');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onError: (error: any) => {
      showToast(error.message || '发送验证码失败', 'error');
    },
  });

  const loginMutation = useMutation({
    mutationFn: () => api.auth.loginWithCode(phone, code),
    onSuccess: result => {
      login(result.user);
      queryClient.setQueryData(['currentUser'], result.user);
      showToast('登录成功！', 'success');
      setCurrentView('chat');
    },
    onError: (error: any) => {
      showToast(error.message || '登录失败，请稍后重试', 'error');
    },
  });

  const quickLoginMutation = useMutation({
    mutationFn: (accessToken: string) => api.auth.loginQuick(accessToken),
    onSuccess: result => {
      login(result.user);
      queryClient.setQueryData(['currentUser'], result.user);
      showToast('登录成功！', 'success');
      setCurrentView('chat');
    },
    onError: (error: any) => {
      showToast(error.message || '一键登录失败，请稍后重试', 'error');
    },
  });

  const captcha = useYiDunCaptcha({
    elementId: 'yidun-captcha',
    captchaId: '2a7b8936e0cf14960b39ef55ca6efe2de',
    mode: 'popup',
    mock: usingMock,
  });

  if (!apiInitialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[#666666] text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  const handleSendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      showToast('请输入正确的手机号', 'error');
      return;
    }

    try {
      showToast('请完成安全验证', 'info');
      const captchaToken = await captcha.verify();
      sendCodeMutation.mutate(captchaToken);
    } catch (error) {
      showToast('验证失败，请重试', 'error');
      captcha.reset();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !code) {
      showToast('请填写完整信息', 'error');
      return;
    }
    loginMutation.mutate();
  };

  const handleQuickLogin = async () => {
    const mockPhone =
      '139' +
      Math.floor(Math.random() * 100000000)
        .toString()
        .padStart(8, '0');
    const mockAccessToken = 'mock_quick_login_' + Date.now();

    console.log('[Quick Login] 模拟一键登录，手机号:', mockPhone);
    showToast('正在进行一键登录...', 'info');

    try {
      quickLoginMutation.mutate(mockAccessToken);
    } catch (error) {
      console.error('[Quick Login] 一键登录失败:', error);
    }
  };

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <div id="yidun-captcha" style={{ display: 'none' }}></div>
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-10">
        <div className="max-w-sm mx-auto w-full">
          <div className="text-center mb-10">
            <h1 className="text-white font-bold text-3xl sm:text-4xl mb-3">Open Elf</h1>
            <p className="text-[#888888] text-base">AI 智能对话助手</p>
          </div>

          <div className="flex gap-3 mb-8 bg-[#1A1A1A] rounded-2xl p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                mode === 'login' ? 'bg-primary text-black' : 'text-[#888888] hover:text-white'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                mode === 'register' ? 'bg-primary text-black' : 'text-[#888888] hover:text-white'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white text-sm font-medium mb-2">手机号</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="请输入手机号"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-primary/50 transition-colors"
                maxLength={11}
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">验证码</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="请输入验证码"
                  className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-primary/50 transition-colors"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0 || sendCodeMutation.isPending}
                  className={`px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap ${
                    countdown > 0 || sendCodeMutation.isPending
                      ? 'bg-[#333333] text-[#666666] cursor-not-allowed'
                      : 'bg-primary text-black hover:bg-primary/90'
                  }`}
                >
                  {countdown > 0
                    ? `${countdown}s`
                    : sendCodeMutation.isPending
                      ? '发送中...'
                      : '获取验证码'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-primary text-black py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors disabled:bg-[#333333] disabled:text-[#666666] disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? '登录中...' : mode === 'login' ? '登录' : '注册'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-[#888888]">或</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickLogin}
              disabled={quickLoginMutation.isPending}
              className="w-full mt-6 bg-[#1A1A1A] border border-white/10 text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#2A2A2A] transition-colors disabled:bg-[#333333] disabled:text-[#666666] disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {quickLoginMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  登录中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  本机号码一键登录
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

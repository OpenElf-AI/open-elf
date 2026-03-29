import { useEffect } from 'react';
import { llmService } from '../services/llmService';

export const useLLMInit = () => {
  useEffect(() => {
    let savedConfig = localStorage.getItem('user_llm_config');

    if (!savedConfig) {
      savedConfig = localStorage.getItem('llm_config');
    }

    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        llmService.setConfig(config);

        if (localStorage.getItem('llm_config') && !localStorage.getItem('user_llm_config')) {
          localStorage.setItem('user_llm_config', savedConfig);
        }
      } catch (error) {
        console.error('Failed to load LLM config:', error);
      }
    }
  }, []);
};

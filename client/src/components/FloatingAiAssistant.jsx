import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const FloatingAiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'أهلاً بك في مساعد ريفليكتو الذكي! 🚗✨ كيف يمكنني مساعدتك اليوم؟',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const widgetRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for event to close this widget when another widget opens
  useEffect(() => {
    const handleClose = () => setIsOpen(false);
    window.addEventListener('close-ai-assistant', handleClose);
    return () => window.removeEventListener('close-ai-assistant', handleClose);
  }, []);

  const toggleOpen = () => {
    if (!isOpen) {
      window.dispatchEvent(new CustomEvent('close-contact-widget'));
    }
    setIsOpen((prev) => !prev);
  };

  // Core send function — accepts optional text override (for quick replies)
  const sendMessage = useCallback(async (overrideText) => {
    const trimmed = (overrideText !== undefined ? overrideText : input).trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    if (overrideText === undefined) setInput('');
    setIsLoading(true);

    // History payload for API: include all conversation context (up to last 10 messages)
    const historySnapshot = updatedMessages
      .slice(1)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await api.post('/ai/chat', {
        message: trimmed,
        history: historySnapshot,
      });
      const reply =
        res?.reply ||
        res?.data?.reply ||
        'عذراً، لم أتمكن من الرد الآن. يرجى المحاولة مجدداً.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'عذراً، حدث خطأ مؤقت. يمكنك التواصل معنا مباشرة عبر واتساب أو الاتصال.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickReplies = ['أسعار الباقات؟', 'ما هو PPF؟', 'فروع ريفليكتو', 'احجز موعد'];

  return (
    /*
     * Positioned to the RIGHT side of the contact widget.
     * Contact widget: bottom-6, left-6 (w-14 = 56px → ends at left-20 ≈ 80px)
     * AI widget:      bottom-6, right-6 → stays on the right side
     * Chat window opens UPWARD to avoid covering the contact widget area.
     */
    <div
      ref={widgetRef}
      className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end select-none font-body max-w-[calc(100vw-32px)] sm:max-w-lg"
    >
      {/* Chat Window — opens upward */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-5rem)] max-w-xs sm:w-[30rem] bg-[#0e0e12]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] rounded-3xl overflow-hidden duration-200 flex flex-col max-h-[75vh] sm:max-h-[650px]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-500/10 to-transparent border-b border-white/10 flex-shrink-0 relative overflow-hidden">
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                <span className="material-symbols-outlined text-white text-xl">smart_toy</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">مساعد ريفليكتو AI</h3>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  متاح الآن
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="relative z-10 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="إغلاق"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[150px] max-h-[350px]">
            {messages.map((msg, i) => {
              const formatMessageText = (text) => {
                if (!text) return '';
                // 1. Convert Markdown **text** to <b>text</b>
                let formatted = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                // 2. Convert Markdown bullet points (* item or - item) to • item
                formatted = formatted.replace(/^\s*[\*\-]\s+(.*)$/gm, '• $1');
                // 3. Convert newlines to <br/> if not already HTML linebreaks
                formatted = formatted.replace(/\r?\n/g, '<br/>');
                return formatted;
              };

              return (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[88%] text-sm leading-relaxed px-4 py-3 rounded-2xl break-words ${
                      msg.role === 'user'
                        ? 'bg-white/[0.06] text-white rounded-bl-sm'
                        : 'bg-gradient-to-br from-indigo-500/20 to-indigo-400/10 text-white border border-indigo-500/20 rounded-br-sm shadow-sm'
                    }`}
                    dir="rtl"
                    dangerouslySetInnerHTML={{ __html: formatMessageText(msg.content) }}
                  />
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl rounded-br-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && !isLoading && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-400/30 text-gray-300 hover:text-white transition-all cursor-pointer font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-white/10 flex items-end gap-2 flex-shrink-0">
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب سؤالك هنا..."
              rows={1}
              dir="rtl"
              className="flex-1 bg-white/[0.05] border border-white/10 focus:border-indigo-400/40 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-gray-500 outline-none resize-none transition-colors"
              style={{ maxHeight: '80px' }}
            />
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleOpen}
        className="relative group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-indigo-500/30"
        title="مساعد ريفليكتو الذكي"
        aria-label="AI Assistant"
      >
        <span className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping opacity-30 pointer-events-none" />
        <span className="material-symbols-outlined text-xl sm:text-2xl relative z-10 text-indigo-300">
          {isOpen ? 'close' : 'smart_toy'}
        </span>
        <span className="absolute top-1 right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-[#0f3460] rounded-full z-20" />
      </button>
    </div>
  );
};

export default FloatingAiAssistant;

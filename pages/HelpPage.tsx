
import React, { useState, FormEvent, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { askGemini, isGeminiAvailable } from '../services/geminiService';
import { API_KEY_WARNING } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const HelpPage: React.FC = () => {
  const [question, setQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const geminiAvailable = isGeminiAvailable();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { t } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading || !geminiAvailable) return;

    const userMessage: Message = { id: Date.now().toString(), text: question, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);
    setError(null);

    try {
      const answer = await askGemini(question);
      const botMessage: Message = { id: (Date.now() + 1).toString(), text: answer, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('unexpectedError');
      setError(errorMessage);
      const errorBotMessage: Message = { id: (Date.now() + 1).toString(), text: `${t('error')}: ${errorMessage}`, sender: 'bot' };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const commonQuestionKeys = [
    "¿Cuáles son los métodos de pago aceptados?",
    "¿Cuándo es la fecha límite para el pago de la matrícula del próximo semestre?",
    "¿Cómo puedo obtener un recibo de pago?",
    "¿Hay algúna mora por pago atrasado?",
    "¿Con quién me comunico si tengo problemas en la facturación?"
  ];

  const handleCommonQuestionClick = (q: string) => {
    setQuestion(q);
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">{t('helpCenter')}</h1>

      {!geminiAvailable && (
        <Card title="API Key Missing" className="border-l-4 border-red-500 bg-red-50">
          <p className="text-red-700">{API_KEY_WARNING}</p>
          <p className="text-red-600 mt-2">{t('aiAssistantUnavailable')}</p>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card title={t('askAiAssistant')} bodyClassName="flex flex-col h-[calc(100vh-15rem)] max-h-[700px]">
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-md mb-4">
                    {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                        className={`max-w-xl px-4 py-2 rounded-lg shadow ${
                            msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
                        }`}
                        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                        >
                        {msg.text}
                        </div>
                    </div>
                    ))}
                    {isLoading && messages.length > 0 && messages[messages.length-1].sender === 'user' && (
                        <div className="flex justify-start">
                            <div className="max-w-xs px-4 py-2 rounded-lg shadow bg-white text-gray-800">
                                <LoadingSpinner size="sm" text={t('thinking') + "..."} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="flex items-center border-t pt-4">
                    <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={geminiAvailable ? t('typeYourQuestion') : t('aiAssistantUnavailable')}
                    className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                    disabled={isLoading || !geminiAvailable}
                    />
                    <Button type="submit" variant="primary" className="rounded-l-none" disabled={isLoading || !question.trim() || !geminiAvailable}>
                    {isLoading ? (
                        <LoadingSpinner size="sm" color="text-white" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    )}
                    </Button>
                </form>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card title={t('commonQuestions')}>
                <ul className="space-y-2">
                    {commonQuestionKeys.map((q, index) => (
                    <li key={index}>
                        <button 
                            onClick={() => handleCommonQuestionClick(q)} // Or t(q_key) if common questions are also translated
                            className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-md text-blue-600 hover:text-blue-700 transition-colors text-sm"
                            disabled={!geminiAvailable}
                        >
                        {q} 
                        </button>
                    </li>
                    ))}
                </ul>
            </Card>
             <Card title={t('contactSupport')}>
                <p className="text-gray-700 mb-2">{t('contactSupportMessage')}</p>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li><strong>{t('emailLabel')}</strong> reinobritanico@school.edu</li>
                    <li><strong>{t('phoneLabel')}</strong> (01) 456-7890</li>
                    <li><strong>{t('officeHoursLabel')}</strong> {t('officeHoursTime')}</li>
                </ul>
            </Card>
        </div>

      </div>
    </div>
  );
};

export default HelpPage;

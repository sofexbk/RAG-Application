import { useState, useRef, useEffect } from "react";
import { FaRobot, FaUser, FaPaperPlane, FaSpinner, FaTrash, FaCopy, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import type { QueryResponse } from "../types";
import { queryQA } from "../api";

type Props = { 
  token: string;
  darkMode?: boolean;
};

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  response?: QueryResponse;
  error?: string;
}

export default function Chat({ token, darkMode = false }: Props) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const ask = async () => {
    if (!q.trim()) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      type: 'user',
      content: q.trim(),
      timestamp: new Date()
    };

    const assistantMessage: ChatMessage = {
      id: generateId(),
      type: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setQ("");
    setLoading(true);

    try {
      const response = await queryQA(q, token);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: response.answer, response }
          : msg
      ));
    } catch (e: any) {
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: "Désolé, une erreur s'est produite.", error: e.message || "Query error" }
          : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`max-w-4xl mx-auto mt-10 rounded-2xl shadow-lg overflow-hidden border ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      {/* Header */}
      <div className={`p-6 ${
        darkMode 
          ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
          : 'bg-gradient-to-r from-green-600 to-emerald-600'
      } text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <FaRobot className="text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Assistant IA</h3>
              <p className="text-green-100">Posez vos questions sur le document</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Effacer la conversation"
            >
              <FaTrash className="text-sm" />
              <span className="hidden sm:inline">Effacer</span>
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className={`h-96 overflow-y-auto p-6 space-y-6 ${
          darkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <FaRobot className={`mx-auto text-6xl mb-4 ${
              darkMode ? 'text-gray-600' : 'text-gray-300'
            }`} />
            <h4 className={`text-xl font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Commencez une conversation
            </h4>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Posez une question sur le document uploadé pour obtenir des réponses précises.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
              <button
                onClick={() => setQ("Résume le document en quelques points")}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300' 
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>💡 Exemple :</span>
                <br />
                <span>Résume le document</span>
              </button>
              <button
                onClick={() => setQ("Quels sont les points clés ?")}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300' 
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>💡 Exemple :</span>
                <br />
                <span>Points clés ?</span>
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.type === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <FaRobot className="text-white text-sm" />
                  </div>
                </div>
              )}
              
              <div className={`max-w-3xl ${message.type === 'user' ? 'order-first' : ''}`}>
                <div className={`
                  p-4 rounded-2xl shadow-sm
                  ${message.type === 'user' 
                    ? 'bg-green-600 text-white ml-auto' 
                    : message.error 
                      ? darkMode 
                        ? 'bg-red-900/50 border border-red-700' 
                        : 'bg-red-50 border border-red-200'
                      : darkMode
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-white border border-gray-200'
                  }
                `}>
                  {message.type === 'assistant' && message.id === messages[messages.length - 1]?.id && loading ? (
                    <div className={`flex items-center gap-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <FaSpinner className="animate-spin" />
                      <span>L'assistant réfléchit...</span>
                    </div>
                  ) : (
                    <>
                      {message.error && (
                        <div className="flex items-center gap-2 text-red-600 mb-2">
                          <FaExclamationTriangle />
                          <span className="text-sm font-medium">Erreur</span>
                        </div>
                      )}
                      <div className={`whitespace-pre-wrap leading-relaxed ${
                        message.type === 'assistant' && !message.error 
                          ? darkMode ? 'text-gray-200' : 'text-gray-800'
                          : ''
                      }`}>
                        {message.content}
                      </div>
                      {message.type === 'assistant' && message.content && (
                        <div className={`flex items-center justify-between mt-3 pt-3 border-t ${
                          darkMode ? 'border-gray-600' : 'border-gray-100'
                        }`}>
                          <span className={`text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${
                              darkMode 
                                ? 'text-gray-400 hover:text-gray-200' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {copiedId === message.id ? (
                              <>
                                <FaCheck className="text-green-600" />
                                <span className="text-green-600">Copié</span>
                              </>
                            ) : (
                              <>
                                <FaCopy />
                                <span>Copier</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Sources */}
                {message.response?.sources && message.response.sources.length > 0 && (
                  <div className={`mt-3 p-4 border rounded-lg ${
                    darkMode 
                      ? 'bg-blue-900/50 border-blue-700' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <h5 className={`font-semibold mb-2 flex items-center gap-2 ${
                      darkMode ? 'text-blue-400' : 'text-blue-800'
                    }`}>
                      📚 Sources
                    </h5>
                    <ul className="space-y-1">
                      {message.response.sources.map((s, idx) => (
                        <li key={idx} className={`text-sm flex items-center gap-2 ${
                          darkMode ? 'text-blue-300' : 'text-blue-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            darkMode ? 'bg-blue-400' : 'bg-blue-400'
                          }`}></span>
                          <span className="flex-1">
                            {s.title || s.document_title || s.name || `Document ${s.document_id}`}
                            {s.score && (
                              <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                darkMode 
                                  ? 'bg-blue-800 text-blue-300' 
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                {(s.score * 100).toFixed(0)}% match
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {message.type === 'user' && (
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-600'
                  }`}>
                    <FaUser className="text-white text-sm" />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className={`border-t p-6 ${
        darkMode 
          ? 'border-gray-700 bg-gray-800' 
          : 'border-gray-200 bg-white'
      }`}>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question sur le document..."
              className={`w-full p-4 rounded-full border transition-all pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
              }`}
              disabled={loading}
            />
            <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <kbd className={`px-2 py-1 text-xs rounded ${
                darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>Enter</kbd>
            </div>
          </div>
          <button
            onClick={ask}
            disabled={loading || !q.trim()}
            className={`
              flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200
              ${loading || !q.trim()
                ? darkMode 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg transform hover:scale-105'
              }
            `}
          >
            {loading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </div>
        
        {q.trim() && (
          <div className={`mt-2 text-xs ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            💡 Appuyez sur Entrée pour envoyer votre question
          </div>
        )}
      </div>
    </div>
  );
}
import { useGameStore } from "../store/gameStore";
import { useState } from "react";

export default function CaixaMensagens() {
  const { language, news } = useGameStore();
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const selectedMessage = news.find(m => m.id === selectedMessageId);

  const handleSelectMessage = (id: string) => {
    setSelectedMessageId(id);
    // TODO: implement markNewsRead if needed
  };

  return (
    <main className="font-sans bg-white dark:bg-[#1a1a1a] text-black dark:text-white min-h-[70vh] px-4 py-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-4 transition-colors">
      
      {/* Left Column: Inbox List */}
      <div className="w-full md:w-96 flex flex-col gap-4 shrink-0">
        <section className="bg-white dark:bg-[#222] border-2 border-black dark:border-gray-700 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] h-full flex flex-col">
          <div className="bg-green-800 dark:bg-green-900 text-white font-bold text-[12px] uppercase px-3 py-2 border-b-2 border-black dark:border-gray-900 mb-3 flex justify-between items-center">
            <span>{language === 'pt' ? 'Caixa de Entrada' : language === 'es' ? 'Bandeja de Entrada' : 'Inbox'}</span>
            <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px]">
              {news.filter(m => !m.isRead).length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto border border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#111]">
            {news.length === 0 ? (
              <p className="text-[10px] text-center mt-4 text-gray-500">
                {language === 'pt' ? 'Nenhuma mensagem.' : language === 'es' ? 'No hay mensajes.' : 'No messages.'}
              </p>
            ) : (
              <div className="flex flex-col">
                {news.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg.id)}
                    className={`flex flex-col p-3 text-left border-b border-gray-200 dark:border-gray-700 transition-colors ${
                      selectedMessageId === msg.id 
                        ? 'bg-green-800 text-white' 
                        : msg.isRead 
                          ? 'hover:bg-gray-100 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300' 
                          : 'bg-white dark:bg-[#222] font-bold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#333]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[11px] font-black uppercase tracking-tight truncate pr-2">
                        {msg.type === 'error' ? 'URGENTE' : 'JORNAL DO CLUBE'}
                      </span>
                      <span className="text-[9px] opacity-70 whitespace-nowrap">
                        {new Date(msg.date).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <span className="text-[12px] truncate opacity-90">
                      {msg.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Right Column: Message View */}
      <div className="flex-1 flex flex-col border border-black dark:border-gray-600 bg-white dark:bg-[#222] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] overflow-hidden">
        {selectedMessage ? (
          <div className="flex flex-col h-full">
            <div className="bg-gray-200 dark:bg-[#333] px-6 py-4 border-b-2 border-black dark:border-gray-900 flex flex-col gap-1">
              <h2 className="text-[18px] font-black text-green-800 dark:text-green-400 uppercase tracking-tight">
                {selectedMessage.title}
              </h2>
              <div className="flex justify-between items-center text-[11px] font-bold text-gray-600 dark:text-gray-400">
                <span>{language === 'pt' ? 'De:' : 'From:'} {selectedMessage.type === 'error' ? 'DIRETORIA' : 'JORNAL'}</span>
                <span>{new Date(selectedMessage.date).toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US')}</span>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-[#222] text-[14px] leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {selectedMessage.content}
            </div>
            
            <div className="bg-gray-100 dark:bg-[#111] px-4 py-3 border-t border-gray-300 dark:border-gray-700 flex justify-end gap-2">
               <button 
                  onClick={() => setSelectedMessageId(null)}
                  className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-2 text-[11px] font-bold uppercase border border-black dark:border-gray-900 shadow-sm hover:bg-gray-400 dark:hover:bg-gray-500 active:translate-y-[1px] active:shadow-none transition-all"
               >
                 {language === 'pt' ? 'Fechar' : language === 'es' ? 'Cerrar' : 'Close'}
               </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#111]">
            <div className="text-center text-gray-400 dark:text-gray-600">
              <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">mail</span>
              <p className="text-[12px] font-bold uppercase tracking-widest">
                {language === 'pt' ? 'Selecione uma mensagem' : language === 'es' ? 'Seleccione un mensaje' : 'Select a message'}
              </p>
            </div>
          </div>
        )}
      </div>

    </main>
  );
}

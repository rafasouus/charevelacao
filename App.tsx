import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Settings, Share2, Check, Sparkles } from 'lucide-react';
import Countdown from './components/Countdown';
import VotingForm from './components/VotingForm';
import PollChart from './components/PollChart';
import { Vote } from './types';
import { fetchVotesFromSheet, sendVoteToSheet } from './services/sheetService';

// Default URL provided by the user
const DEFAULT_SHEET_URL = "https://script.google.com/macros/s/AKfycbzsSd8afh7jGQwmR5S3J8Abb98H2x4KHqGi38GM5DAwc8xPGxipud5tP3kYu-OCnFL3HQ/exec";

const App: React.FC = () => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [sheetUrl, setSheetUrl] = useState<string>(DEFAULT_SHEET_URL);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Load settings and initial data
  useEffect(() => {
    const savedUrl = localStorage.getItem('google_sheet_url');
    const activeUrl = savedUrl || DEFAULT_SHEET_URL;
    
    setSheetUrl(activeUrl);

    // Initial Local Load
    const localVotes = localStorage.getItem('reveal_votes');
    if (localVotes) {
      try {
        setVotes(JSON.parse(localVotes));
      } catch (e) {
        console.error("Failed to parse votes", e);
      }
    }

    // Fetch from cloud
    if (activeUrl) {
      refreshData(activeUrl);
    }
  }, []);

  const refreshData = async (url: string) => {
    setIsSyncing(true);
    const cloudVotes = await fetchVotesFromSheet(url);
    if (cloudVotes && cloudVotes.length > 0) {
      setVotes(cloudVotes);
      // Sync local storage to match cloud
      localStorage.setItem('reveal_votes', JSON.stringify(cloudVotes));
    }
    setIsSyncing(false);
  };

  const handleSaveConfig = (url: string) => {
    setSheetUrl(url);
    localStorage.setItem('google_sheet_url', url);
    refreshData(url);
    setShowConfig(false);
  };

  const handleVote = async (newVote: Vote) => {
    // 1. Optimistic UI update
    const updatedVotes = [...votes, newVote];
    setVotes(updatedVotes);
    
    // 2. Save Local (Backup)
    localStorage.setItem('reveal_votes', JSON.stringify(updatedVotes));

    // 3. Send to Cloud if configured
    if (sheetUrl) {
      setIsSyncing(true);
      await sendVoteToSheet(sheetUrl, newVote);
      // Wait a sec then refresh to ensure consistency
      setTimeout(() => refreshData(sheetUrl), 1000);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-pink-100 font-sans text-gray-800 overflow-x-hidden relative selection:bg-purple-200">
      
      {/* Abstract Background Shapes */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-200/40 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 flex flex-col items-center">
        
        {/* Top Actions Bar */}
        <div className="w-full flex justify-end gap-3 mb-6">
            <button 
                onClick={handleShare}
                className={`p-2 rounded-full transition-all shadow-sm flex items-center gap-2 px-4 backdrop-blur-sm border ${linkCopied ? 'bg-green-100/80 border-green-200 text-green-700' : 'bg-white/60 border-white text-indigo-600 hover:bg-white'}`}
            >
                {linkCopied ? <Check size={18} /> : <Share2 size={18} />}
                <span className="text-sm font-bold">{linkCopied ? 'Copiado!' : 'Convidar'}</span>
            </button>
            <button 
                onClick={() => setShowConfig(!showConfig)}
                className="p-2 bg-white/60 backdrop-blur-sm border border-white rounded-full text-gray-500 hover:text-indigo-600 transition-colors shadow-sm"
            >
                <Settings size={20} />
            </button>
        </div>

        {/* Hero Section */}
        <header className="text-center mb-8 relative w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/70 backdrop-blur-md rounded-full shadow-sm text-xs font-bold tracking-widest text-indigo-400 mb-6 border border-white uppercase">
            <Sparkles size={14} /> Chá Revelação
          </div>
          
          <div className="relative">
            <h1 className="text-6xl md:text-8xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-[#5CA0D3] via-purple-400 to-[#D86B99] mb-4 drop-shadow-sm leading-tight tracking-tight">
              Miguel <br className="md:hidden" />
              <span className="text-3xl md:text-5xl text-gray-300 font-light align-middle mx-2">&</span>
              <br className="md:hidden" /> Catarina
            </h1>
          </div>
          
          <p className="text-gray-500 font-medium text-lg md:text-xl max-w-2xl mx-auto">
            Faça sua aposta e ajude os papais a montarem o enxoval!
          </p>
        </header>

        {/* Info Bar (Date & Location) */}
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl justify-center mb-10">
            <div className="bg-white/60 backdrop-blur-md border border-white p-4 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow flex-1">
                <div className="bg-blue-100 p-3 rounded-xl text-blue-500">
                    <Calendar size={24} />
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Data</p>
                    <p className="font-heading font-bold text-gray-800 text-lg">14/02/2026</p>
                    <p className="text-sm text-gray-500">Sábado às 15:30</p>
                </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-md border border-white p-4 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow flex-1">
                <div className="bg-pink-100 p-3 rounded-xl text-pink-500">
                    <MapPin size={24} />
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Local</p>
                    <p className="font-heading font-bold text-gray-800 text-lg">Casa da Vovó</p>
                    <p className="text-sm text-gray-500">Rua da Felicidade, 123</p>
                </div>
            </div>
        </div>

        {/* Configuration (Hidden) */}
        {showConfig && (
          <div className="w-full max-w-lg mb-8 bg-white border border-indigo-100 p-6 rounded-2xl shadow-xl animate-fade-in-up z-50">
            <p className="text-sm text-gray-500 mb-2 font-bold">Link da Planilha (Script Web App):</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 px-4 py-2 border rounded-lg text-sm bg-gray-50"
                defaultValue={sheetUrl}
                onBlur={(e) => handleSaveConfig(e.target.value)}
              />
              <button 
                onClick={() => setShowConfig(false)}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold"
              >
                OK
              </button>
            </div>
          </div>
        )}

        <Countdown />

        {/* Main Content Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full mt-8">
          
          {/* Left: Voting Form (Takes 7 columns on large screens) */}
          <div className="lg:col-span-7">
            <VotingForm onVote={handleVote} />
          </div>

          {/* Right: Chart (Takes 5 columns on large screens) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
             <PollChart votes={votes} />
             
             {/* Fun Hint Card */}
             <div className="bg-white/60 backdrop-blur-sm border border-white rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles size={80} className="text-purple-500 rotate-12" />
                </div>
                <h3 className="font-heading font-bold text-lg text-indigo-900 mb-2">🎁 Dica de Presente</h3>
                <p className="text-gray-600 text-sm leading-relaxed relative z-10">
                  <span className="font-bold text-blue-500">Time Miguel:</span> Pacote de Fraldas.<br/>
                  <span className="font-bold text-pink-500">Time Catarina:</span> Lenços Umedecidos.
                </p>
             </div>
          </div>
        </div>

        <footer className="mt-20 text-center text-gray-400 text-sm pb-8">
          <p className="font-medium opacity-50">Feito com carinho para Miguel e Catarina ❤️</p>
          <div className="mt-2 flex items-center justify-center gap-2 text-xs opacity-40">
             <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
             {sheetUrl ? 'Sincronizado' : 'Offline'}
          </div>
        </footer>

      </main>
    </div>
  );
};

export default App;
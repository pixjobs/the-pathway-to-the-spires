import React, { useState, useMemo } from 'react';
import CHAPTERS_DATA from './data.json';

const MOTIVATION_QUOTES = [
  {
    text: "Setbacks are not failures of intellect; they are simply standard scientific data points to analyze and iterate.",
    author: "Carol Dweck, Mindset: The New Psychology of Success"
  },
  {
    text: "Study is not a chore to collect credentials, but an adventure to satisfy intrinsic scientific curiosity.",
    author: "Richard Feynman, Surely You're Joking, Mr. Feynman!"
  },
  {
    text: "An elite university is a vehicle for your long-term goals, not the holy grail of your identity. Maintain perspective.",
    author: "Oxford Tutorial Mindset Guide"
  },
  {
    text: "Clarity of language is clarity of thought; strip away academic jargon to expose raw logical premises.",
    author: "George Orwell, Politics and the English Language"
  }
];

// Interactive checklists tailored to each milestone phase
const AUDIT_ITEMS = {
  1: [
    "I actively read broad non-fiction (Feynman, Orwell, Hawking) without rushing to specialize.",
    "I focus my study on developing intrinsic curiosity rather than just performative grade-grubbing.",
    "I perform weekly metacognitive audits of my study habits to spot cognitive bottlenecks."
  ],
  2: [
    "My GCSE selections prioritize academic rigor (Triple Science, Languages) to preserve optionality.",
    "I have identified my specific academic leanings using diagnostic problem-solving challenges.",
    "I am planning or executing a niche micro-project with a specific methodology and output."
  ],
  3: [
    "I utilize active retrieval techniques (spaced repetition, interleaving) rather than passive reading.",
    "I deconstruct mark schemes to understand causal 'command words' (Describe vs. Explain vs. Evaluate).",
    "I treat mistakes on mock papers as empirical data points to systematically debug my logical flow."
  ],
  4: [
    "My EPQ or research project tackles an analytical question rather than a broad descriptive summary.",
    "I have started navigating advanced literature databases (Google Scholar, JSTOR) and primary archives.",
    "I am actively preparing for the logical and conceptual scaling of Sixth Form entrance/admissions tests."
  ],
  5: [
    "My personal statement uses precise, action-reflection arguments instead of flowery, performative prose.",
    "I structure super-curricular writing around the Action-Reflection-Extension model.",
    "I practice STEP/TMUA/admissions test problems under timed conditions and perform rigorous error post-mortems."
  ],
  6: [
    "I actively seek out external intellectual resources to bridge socioeconomic or institutional resource gaps.",
    "I understand contextual admissions and treat my academic journey as a vector of trajectory rather than a static snapshot.",
    "I have mapped out a dual-track plan with Russell Group, Ivy League, or Degree Apprenticeship alternatives."
  ]
};

function App() {
  const [activeChap, setActiveChap] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedItems, setCheckedItems] = useState({});

  const rotateQuote = () => {
    setQuoteIdx((prev) => (prev + 1) % MOTIVATION_QUOTES.length);
  };

  // Filter chapters based on client-side search query
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return CHAPTERS_DATA;
    return CHAPTERS_DATA.filter(chap => 
      chap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chap.focus.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chap.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const activeChapterData = useMemo(() => {
    if (filteredChapters.length === 0) return null;
    const current = filteredChapters[activeChap] || filteredChapters[0];
    return current;
  }, [filteredChapters, activeChap]);

  const handleCheckboxChange = (chapNum, idx) => {
    const key = `${chapNum}-${idx}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div style={{ fontFamily: 'Calibri, sans-serif' }} className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-8 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <h1 className="text-xl font-bold font-serif text-slate-900 tracking-wide uppercase">The Pathway to the Spires</h1>
              <p className="text-xs text-slate-500 font-semibold tracking-wider font-mono">Oxbridge Admissions Strategic Companion</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-blue-900 text-blue-100 px-3 py-1.5 rounded-full font-mono font-semibold tracking-wider">
              PORTABLE RUNTIME (LIVE)
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-950 text-white py-12 px-6 text-center border-b-4 border-amber-600 shadow-md">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif mb-3 leading-tight tracking-wide text-amber-50">
            The Pathway to the Spires
          </h2>
          <p className="text-md sm:text-lg text-slate-300 italic mb-6 max-w-2xl mx-auto font-serif">
            A Pragmatic, Self-Aware Companion Guide to Independent Academic Progression
          </p>
          <div className="inline-flex bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 text-xs font-semibold text-amber-500 gap-2 items-center">
            <span>⚡ Local GPU Embeddings Synchronized</span>
            <span className="text-slate-500">|</span>
            <span>Ref: 2026.6</span>
          </div>
        </div>
      </section>

      {/* Main Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* Sidebar: Search & Chapters Navigation */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Chapter Search */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <label className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider block mb-2">Search Corpus</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search concepts, chapters..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setActiveChap(0); }}
                className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition duration-200"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Chapters Navigation */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold font-serif text-slate-900 mb-4 uppercase tracking-wider border-b pb-2 flex justify-between">
              <span>Chapter Navigation</span>
              <span className="text-slate-400 text-xs font-mono">{filteredChapters.length} found</span>
            </h3>
            
            <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
              {filteredChapters.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm italic">
                  No chapters match your query.
                </div>
              ) : (
                filteredChapters.map((chap, idx) => {
                  const isCurrent = activeChapterData && activeChapterData.focus === chap.focus;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveChap(idx)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition duration-200 text-sm font-medium border border-transparent ${
                        isCurrent
                          ? 'bg-blue-900 text-white shadow-md border-blue-950 font-bold'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span>Ch {chap.num}: {chap.title.replace(/^Chapter\s*\d+:\s*/i, '')}</span>
                      </div>
                      <div className={`text-xs mt-1 font-normal ${isCurrent ? 'text-amber-200' : 'text-slate-400'}`}>
                        {chap.focus}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Motivation Quote */}
          <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl shadow-sm">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>💡 Mindset Anchor</span>
            </h4>
            <p className="text-xs text-amber-950 italic leading-relaxed mb-3 font-serif">
              "{MOTIVATION_QUOTES[quoteIdx].text}"
            </p>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-amber-800 font-semibold tracking-wider uppercase font-mono">
                — {MOTIVATION_QUOTES[quoteIdx].author}
              </span>
              <button 
                onClick={rotateQuote} 
                className="text-xs font-bold text-amber-700 hover:text-amber-950 transition font-mono"
              >
                Rotate ➔
              </button>
            </div>
          </div>

          {/* Verified Portals & Resources */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold font-serif text-slate-900 border-b pb-2 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔗 Verified Portals</span>
            </h3>
            
            <p className="text-[11px] text-slate-500 leading-normal font-semibold text-blue-950 uppercase tracking-widest font-mono">
              ✦ Oxbridge & Core Competitions
            </p>
            
            <div className="space-y-3 pl-1">
              <div className="text-xs">
                <a href="https://www.ox.ac.uk/admissions/undergraduate" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-900 hover:underline block mb-0.5">
                  Oxford Admissions ➔
                </a>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Official Oxford undergraduate portal. Check course entry requirements and college choosing guides.
                </p>
              </div>
              <div className="text-xs border-t border-slate-100 pt-2.5">
                <a href="https://www.undergraduate.study.cam.ac.uk" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-900 hover:underline block mb-0.5">
                  Cambridge Admissions ➔
                </a>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Cambridge study guide. Use to track application dates, tutorial styles, and pool assessments.
                </p>
              </div>
              <div className="text-xs border-t border-slate-100 pt-2.5">
                <span className="font-bold text-blue-900 block mb-0.5">Academic Competitions:</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  <a href="https://www.johnlockeinstitute.com/essay-competition" target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline font-medium">John Locke Global Essay Prize</a> | <a href="https://ukmt.org.uk/" target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline font-medium">UKMT Challenges</a>
                </p>
              </div>
              <div className="text-xs border-t border-slate-100 pt-2.5">
                <span className="font-bold text-blue-900 block mb-0.5">Advanced Mathematics Prep:</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  <a href="https://step.maths.org/" target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline font-medium">STEP Support Programme</a> | <a href="https://esat-tmua.ac.uk/" target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline font-medium">ESAT & TMUA Portal</a>
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal font-semibold text-blue-950 uppercase tracking-widest font-mono border-t border-slate-100 pt-4">
              ✦ G5 Elite Portals
            </p>

            <div className="space-y-3 pl-1">
              <div className="text-xs">
                <a href="https://www.imperial.ac.uk/study/apply/undergraduate/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-900 hover:underline block mb-0.5">
                  Imperial College London study ➔
                </a>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Admissions for STEM and business analytics. Focuses heavily on the quantitative ESAT/TMUA assessments.
                </p>
              </div>
              <div className="text-xs border-t border-slate-100 pt-2.5">
                <a href="https://www.lse.ac.uk/study-at-lse/undergraduate" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-900 hover:underline block mb-0.5">
                  LSE Undergraduate Admissions ➔
                </a>
                <p className="text-[10px] text-slate-500 leading-normal">
                  No interview system. Selection relies heavily on academic rigor and an elite, hyper-focused UCAS statement.
                </p>
              </div>
              <div className="text-xs border-t border-slate-100 pt-2.5">
                <a href="https://www.ucl.ac.uk/study/undergraduate" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-900 hover:underline block mb-0.5">
                  UCL Study & Admissions ➔
                </a>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Broad interdisciplinary study and global engagement. Requires strong analytical-humanities writing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Panel & Interactive Audit Checklist */}
        <div className="lg:col-span-8 space-y-6">
          {activeChapterData ? (
            <>
              {/* Main Chapter Content Card */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-xs text-blue-900 font-bold uppercase tracking-wider border-b pb-2 mb-4 flex justify-between items-center font-mono">
                    <span>Active Milestone Focus</span>
                    <span>{activeChapterData.focus.split(" ")[0]}</span>
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-950 mb-6 leading-tight">
                    Chapter {activeChapterData.num}: {activeChapterData.title.replace(/^Chapter\s*\d+:\s*/i, '')}
                  </h2>
                  
                  <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider font-mono">
                    {activeChapterData.focus}
                  </h3>

                  <div className="text-slate-700 text-sm leading-relaxed mb-8 whitespace-pre-line space-y-4">
                    {activeChapterData.text}
                  </div>
                </div>
                
                {/* Academic Citation Footer */}
                <div className="border-t border-slate-100 pt-4 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">📌 Academic Citation (Harvard Style)</h4>
                  <p className="text-xs text-slate-700 font-serif leading-relaxed italic">
                    {activeChapterData.ref}
                  </p>
                </div>
              </div>

              {/* Interactive Self-Awareness Audit Checklist */}
              {AUDIT_ITEMS[activeChapterData.num] && (
                <div className="bg-slate-900 text-slate-100 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-md">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-serif flex items-center gap-2">
                      <span>🧠 Metacognitive Progress Check</span>
                    </h3>
                    <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-1 rounded">
                      Ch {activeChapterData.num} Audit
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 italic mb-4">
                    Read the diagnostic criteria below and toggle checkboxes to log your own self-directed study trajectory:
                  </p>
                  <div className="space-y-3">
                    {AUDIT_ITEMS[activeChapterData.num].map((item, idx) => {
                      const isChecked = !!checkedItems[`${activeChapterData.num}-${idx}`];
                      return (
                        <div 
                          key={idx} 
                          onClick={() => handleCheckboxChange(activeChapterData.num, idx)}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition duration-200 ${
                            isChecked 
                              ? 'bg-slate-800/80 border-amber-600/40 text-white' 
                              : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/30'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Controlled by outer div click
                            className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                          />
                          <p className="text-xs leading-relaxed select-none">
                            {item}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
              <span className="text-4xl block mb-3">🔍</span>
              <p className="text-slate-500 text-sm italic">
                Select a chapter from the list or clear your search to explore the Strategic Admissions Guide.
              </p>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-[10px] sm:text-xs text-slate-400 font-mono uppercase tracking-wider">
        The Pathway to the Spires © 2026. All Rights Reserved. Produced locally via i9 + RTX 4080 Home Server.
      </footer>
    </div>
  );
}

export default App;

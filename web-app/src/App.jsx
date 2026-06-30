import React, { useState, useMemo } from 'react';
import CHAPTERS_DATA from './data.json';
import JOURNAL_DATA from './journal.json';

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

function renderInlineMarkdown(text) {
  if (!text) return "";
  const boldParts = text.split('**');
  return boldParts.map((bPart, bIdx) => {
    const isBold = bIdx % 2 === 1;
    const italicParts = bPart.split('*');
    const renderedItalic = italicParts.map((iPart, iIdx) => {
      const isItalic = iIdx % 2 === 1;
      return isItalic ? <em key={iIdx}>{iPart}</em> : iPart;
    });
    return isBold ? <strong key={bIdx}>{renderedItalic}</strong> : renderedItalic;
  });
}

function parseMarkdown(text) {
  if (!text) return null;
  const cleanText = text.replace(/\r/g, '');
  const paragraphs = cleanText.split('\n\n').filter(Boolean);
  let hasShownDropCap = false;

  return paragraphs.map((para, pIdx) => {
    const trimmed = para.trim();
    if (trimmed.startsWith('# ')) {
      return null; // Skip main title
    }
    if (trimmed.startsWith('#### ')) {
      return (
        <h4 key={pIdx} className="text-xs font-bold text-stone-700 tracking-wider uppercase font-mono mt-6 mb-2">
          {trimmed.replace('#### ', '')}
        </h4>
      );
    }
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={pIdx} className="text-lg font-bold text-stone-900 font-serif mt-8 mb-3 border-b border-stone-200 pb-1.5 leading-tight">
          {trimmed.replace('### ', '')}
        </h3>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={pIdx} className="text-xl font-bold text-stone-950 font-serif mt-10 mb-4 leading-tight">
          {trimmed.replace('## ', '')}
        </h2>
      );
    }
    if (trimmed.startsWith('---')) {
      return <hr key={pIdx} className="border-t border-stone-300 my-6" />;
    }

    const lines = para.split('\n').map(l => l.trim()).filter(Boolean);
    const isBulletList = lines.every(line => line.startsWith('* ') || line.startsWith('- '));
    const isNumberedList = lines.every(line => /^\d+\.\s+/.test(line));

    if (isBulletList) {
      return (
        <ul key={pIdx} className="list-disc pl-5 my-4 space-y-2 text-justify text-stone-800">
          {lines.map((line, lIdx) => {
            const cleanLine = line.replace(/^[\*\-]\s+/, '');
            return <li key={lIdx}>{renderInlineMarkdown(cleanLine)}</li>;
          })}
        </ul>
      );
    }

    if (isNumberedList) {
      return (
        <ol key={pIdx} className="list-decimal pl-5 my-4 space-y-3.5 text-justify text-stone-800">
          {lines.map((line, lIdx) => {
            const cleanLine = line.replace(/^\d+\.\s+/, '');
            return <li key={lIdx}>{renderInlineMarkdown(cleanLine)}</li>;
          })}
        </ol>
      );
    }

    // Detect markdown tables: lines with pipe separators | col | col |
    const isTableBlock = lines.every(line => line.includes('|') && !line.trimStart().startsWith('|---') && line.trim() !== '');
    if (isTableBlock && lines.length >= 2) {
      const isHeaderRow = lines[0].includes('|') && /\|\s*-+\s*/.test(lines[1]);
      const headerIdx = isHeaderRow ? 2 : 0; // skip separator line if present
      const tbodyLines = isHeaderRow ? lines.slice(2) : lines;

      function parseTableCells(line) {
        return line.split('|').map(c => c.trim()).filter((c, i, arr) => {
          // Filter out leading/trailing empty cells from | col | col |
          if (i === 0 && c === '') return false;
          if (i === arr.length - 1 && c === '') return false;
          return true;
        });
      }

      return (
        <div key={pIdx} className="my-6 overflow-x-auto rounded-lg border border-stone-200 shadow-sm">
          <table className="w-full border-collapse bg-white">
            {isHeaderRow && (
              <thead>
                <tr>
                  {parseTableCells(lines[0]).map((cell, cIdx) => (
                    <th
                      key={cIdx}
                      className="px-4 py-2.5 text-left text-[11px] font-bold font-sans uppercase tracking-wider text-stone-500 bg-[#F6F3EE] border-b-2 border-stone-200 whitespace-nowrap"
                    >
                      {renderInlineMarkdown(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {tbodyLines.map((line, rIdx) => {
                const cells = parseTableCells(line);
                return (
                  <tr
                    key={rIdx}
                    className={`${rIdx % 2 === 0 ? 'bg-white' : 'bg-[#FBF9F6]'} hover:bg-stone-50 transition-colors duration-100`}
                  >
                    {cells.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`px-4 py-2 text-[12px] text-stone-700 border-b border-stone-100 leading-relaxed ${cIdx === 0 ? 'font-medium text-stone-800' : ''}`}
                      >
                        {renderInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (!hasShownDropCap) {
      hasShownDropCap = true;
      return (
        <p key={pIdx} className="first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-[#1B365D] first-letter:float-left first-letter:mr-3 first-letter:mt-1 text-justify leading-relaxed text-stone-850">
          {renderInlineMarkdown(trimmed)}
        </p>
      );
    }

    return (
      <p key={pIdx} className="text-justify leading-relaxed text-stone-850">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });
}

function renderReferenceLine(line, rIdx) {
  if (!line) return null;
  const parts = [];
  let lastIndex = 0;
  // Match standard markdown link [text](url)
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.substring(lastIndex, match.index));
    }
    parts.push(
      <a 
        key={match.index}
        href={match[2]} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-800 hover:text-blue-950 font-sans font-semibold text-[10px] underline bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 inline-flex items-center gap-0.5 mx-0.5 whitespace-nowrap"
      >
        {match[1]} ➔
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }
  if (lastIndex < line.length) {
    parts.push(line.substring(lastIndex));
  }
  const renderedContent = parts.length > 0 ? parts : line;
  return (
    <div key={rIdx} className="text-xs text-stone-700 font-serif leading-relaxed italic border-b border-stone-100/70 pb-2 last:pb-0 last:border-b-0 text-justify">
      ✦ {renderedContent}
    </div>
  );
}

function App() {
  const [activeChap, setActiveChap] = useState(0);
  const [activeTab, setActiveTab] = useState("chapters"); // "chapters" or "journal"
  const [activeJournalIdx, setActiveJournalIdx] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedItems, setCheckedItems] = useState({});
  const [lang, setLang] = useState("en"); // "en", "zh", "de"

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

  const activeChapterTitle = useMemo(() => {
    if (!activeChapterData) return "";
    if (lang === "zh" && activeChapterData.title_zh) return activeChapterData.title_zh;
    if (lang === "de" && activeChapterData.title_de) return activeChapterData.title_de;
    return activeChapterData.title;
  }, [activeChapterData, lang]);

  const activeChapterFocus = useMemo(() => {
    if (!activeChapterData) return "";
    if (lang === "zh" && activeChapterData.focus_zh) return activeChapterData.focus_zh;
    if (lang === "de" && activeChapterData.focus_de) return activeChapterData.focus_de;
    return activeChapterData.focus;
  }, [activeChapterData, lang]);

  const activeChapterText = useMemo(() => {
    if (!activeChapterData) return "";
    if (lang === "zh" && activeChapterData.text_zh) return activeChapterData.text_zh;
    if (lang === "de" && activeChapterData.text_de) return activeChapterData.text_de;
    return activeChapterData.text;
  }, [activeChapterData, lang]);

  const activeChapterRef = useMemo(() => {
    if (!activeChapterData) return "";
    if (lang === "zh" && activeChapterData.ref_zh) return activeChapterData.ref_zh;
    if (lang === "de" && activeChapterData.ref_de) return activeChapterData.ref_de;
    return activeChapterData.ref;
  }, [activeChapterData, lang]);

  const handleCheckboxChange = (chapNum, idx) => {
    const key = `${chapNum}-${idx}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#2D2A26] flex flex-col font-serif">
      
      {/* Header (High-End Newspaper Title-head) */}
      <header className="bg-[#FAF8F5] border-b-4 border-double border-stone-300 py-6 px-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-extrabold font-serif text-stone-900 tracking-tight uppercase border-b border-stone-200 pb-1 mb-1">
              The Pathway to the Spires
            </h1>
            <p className="text-[11px] text-stone-500 font-semibold tracking-widest font-mono uppercase">
              Elite G5 Admissions & Strategic Spires Companion
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-stone-100 p-0.5 rounded border border-stone-200 shadow-inner font-sans">
              <button
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 text-[10px] font-extrabold rounded transition duration-150 tracking-wider ${
                  lang === "en"
                    ? "bg-[#1B365D] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("zh")}
                className={`px-2.5 py-1 text-[10px] font-extrabold rounded transition duration-150 tracking-wider ${
                  lang === "zh"
                    ? "bg-[#1B365D] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                ZH
              </button>
              <button
                onClick={() => setLang("de")}
                className={`px-2.5 py-1 text-[10px] font-extrabold rounded transition duration-150 tracking-wider ${
                  lang === "de"
                    ? "bg-[#1B365D] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                DE
              </button>
            </div>
            <span className="text-[10px] bg-stone-200 text-stone-700 px-2.5 py-1 rounded font-mono font-bold tracking-widest uppercase shadow-sm">
              LOCAL GPU Spark
            </span>
          </div>
        </div>
      </header>

      {/* Hero (Academic/Editorial Minimalist Panel) */}
      <section className="bg-[#F6F3EE] border-b border-stone-200 py-10 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest font-mono mb-2">
            Independent Scholarly Companion
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-stone-950 mb-3 tracking-tight">
            The Pathway to the Spires
          </h2>
          <p className="text-base text-stone-600 italic max-w-2xl mx-auto leading-relaxed">
            A Pragmatic, Self-Aware Companion Guide to Independent Academic Progression
          </p>
        </div>
      </section>

      {/* Main Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* Sidebar: Search, Navigation & Portals */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Main Tab Switcher */}
          <div className="bg-white p-2 rounded border border-stone-200 shadow-sm flex gap-1 font-sans">
            <button
              onClick={() => setActiveTab("chapters")}
              className={`flex-1 text-center py-2 text-[10px] font-extrabold rounded transition duration-150 tracking-wider uppercase ${
                activeTab === "chapters"
                  ? "bg-[#1B365D] text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900 bg-stone-50"
              }`}
            >
              📖 Milestones Guide
            </button>
            <button
              onClick={() => setActiveTab("journal")}
              className={`flex-1 text-center py-2 text-[10px] font-extrabold rounded transition duration-150 tracking-wider uppercase ${
                activeTab === "journal"
                  ? "bg-[#1B365D] text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900 bg-stone-50"
              }`}
            >
              📓 Living Journal
            </button>
          </div>

          {activeTab === "chapters" ? (
            <>
              {/* Chapter Search (Classically Boxed) */}
              <div className="bg-white p-5 rounded border border-stone-200 shadow-sm">
                <label className="text-[10px] font-bold font-mono text-stone-500 uppercase tracking-wider block mb-2">
                  Search Index & Corpus
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search concepts, chapters..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setActiveChap(0); }}
                    className="w-full text-xs font-sans px-4 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white transition duration-150"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")} 
                      className="absolute right-3 top-2 text-stone-400 hover:text-stone-600 text-sm font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Chapters Navigation (Classical Editorial Block) */}
              <div className="bg-white p-5 rounded border border-stone-200 shadow-sm">
                <h3 className="text-xs font-bold font-serif text-stone-900 mb-4 uppercase tracking-wider border-b border-stone-200 pb-2 flex justify-between">
                  <span>Chapter Navigation</span>
                  <span className="text-stone-400 text-xs font-mono">{filteredChapters.length} found</span>
                </h3>
                
                <div className="flex flex-col gap-1.5 max-h-[350px] overflow-y-auto pr-1">
                  {filteredChapters.length === 0 ? (
                    <div className="text-center py-6 text-stone-400 text-xs italic font-serif">
                      No chapters match your query.
                    </div>
                  ) : (
                    filteredChapters.map((chap, idx) => {
                      const isCurrent = activeChapterData && activeChapterData.focus === chap.focus;
                      const titleToDisplay = lang === "zh" && chap.title_zh ? chap.title_zh : lang === "de" && chap.title_de ? chap.title_de : chap.title;
                      const focusToDisplay = lang === "zh" && chap.focus_zh ? chap.focus_zh : lang === "de" && chap.focus_de ? chap.focus_de : chap.focus;
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveChap(idx)}
                          className={`w-full text-left px-3.5 py-2.5 rounded transition duration-150 text-xs font-medium border ${
                            isCurrent
                              ? 'bg-[#1B365D] text-white border-[#1B365D] font-bold'
                              : 'bg-[#FAF8F5] text-stone-700 hover:bg-stone-50 border-stone-200'
                          }`}
                        >
                          <div className="font-serif">
                            Ch {chap.num}: {titleToDisplay.replace(/^Chapter\s*\d+:\s*/i, '')}
                          </div>
                          <div className={`text-[10px] mt-0.5 font-normal font-sans ${isCurrent ? 'text-stone-200' : 'text-stone-400'}`}>
                            {focusToDisplay}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Living Journal Navigation List */
            <div className="bg-white p-5 rounded border border-stone-200 shadow-sm">
              <h3 className="text-xs font-bold font-serif text-stone-900 mb-4 uppercase tracking-wider border-b border-stone-200 pb-2 flex justify-between">
                <span>Timeline Log Entries</span>
                <span className="text-stone-400 text-xs font-mono">{JOURNAL_DATA.length} logs</span>
              </h3>
              
              <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-1 font-sans">
                {JOURNAL_DATA.length === 0 ? (
                  <div className="text-center py-8 text-stone-400 text-xs italic font-serif">
                    No journal logs available yet. Add YYYY-MM-DD.md files to memory/ to update!
                  </div>
                ) : (
                  JOURNAL_DATA.map((entry, idx) => {
                    const isCurrent = activeJournalIdx === idx;
                    const firstLine = entry.content.split('\n').filter(Boolean)[0] || "";
                    const previewTitle = firstLine.replace(/^#\s*/, '').replace(/^OpenClaw Daily Memories\s*-\s*/, '');
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveJournalIdx(idx)}
                        className={`w-full text-left px-3.5 py-2.5 rounded transition duration-150 text-xs font-medium border ${
                          isCurrent
                            ? 'bg-[#1B365D] text-white border-[#1B365D] font-bold'
                            : 'bg-[#FAF8F5] text-stone-700 hover:bg-stone-50 border-stone-200'
                        }`}
                      >
                        <div className="font-mono font-bold text-[11px] flex justify-between items-center">
                          <span>📅 {entry.date}</span>
                          <span className={`text-[9px] uppercase px-1 rounded ${isCurrent ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'}`}>
                            Log #{JOURNAL_DATA.length - idx}
                          </span>
                        </div>
                        <div className={`text-[10px] mt-1 font-serif leading-relaxed truncate ${isCurrent ? 'text-stone-200' : 'text-stone-500'}`}>
                          {previewTitle || "Daily Notes"}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Motivation Quote (Prestige Muted Callout) */}
          <div className="bg-[#FAF8F5] border border-stone-200 p-5 rounded">
            <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2 font-mono flex items-center gap-1.5">
              <span>💡 Mindset Anchor</span>
            </h4>
            <p className="text-xs text-stone-800 italic leading-relaxed mb-3">
              "{MOTIVATION_QUOTES[quoteIdx].text}"
            </p>
            <div className="flex justify-between items-center border-t border-stone-100 pt-2.5">
              <span className="text-[9px] text-stone-500 font-semibold tracking-wide uppercase font-sans">
                — {MOTIVATION_QUOTES[quoteIdx].author}
              </span>
              <button 
                onClick={rotateQuote} 
                className="text-[10px] font-bold text-stone-700 hover:text-stone-950 transition font-mono uppercase tracking-wider"
              >
                Next ➔
              </button>
            </div>
          </div>

          {/* Verified Portals & Resources (High-End Links Hub) */}
          <div className="bg-white p-5 rounded border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold font-serif text-stone-900 border-b border-stone-200 pb-2 uppercase tracking-wider">
              🔗 Verified Portals
            </h3>
            
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">
              ✦ Oxbridge & Core Competitions
            </p>
            
            <div className="space-y-3 pl-1 font-sans">
              <div className="text-[11px]">
                <a href="https://www.ox.ac.uk/admissions/undergraduate" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-900 hover:underline block mb-0.5">
                  Oxford Admissions ➔
                </a>
                <p className="text-[10px] text-stone-500 leading-normal">
                  Check course entry requirements and collegiate choosing guides.
                </p>
              </div>
              <div className="text-[11px] border-t border-stone-100 pt-2.5">
                <a href="https://www.undergraduate.study.cam.ac.uk" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-900 hover:underline block mb-0.5">
                  Cambridge Admissions ➔
                </a>
                <p className="text-[10px] text-stone-500 leading-normal">
                  Track Cambridge application dates, tutorial styles, and pool assessments.
                </p>
              </div>
              <div className="text-[11px] border-t border-stone-100 pt-2.5">
                <span className="font-bold text-[#1B365D] block mb-0.5 uppercase tracking-wider text-[9px]">Competitions:</span>
                <p className="text-[10px] text-stone-500 leading-normal">
                  <a href="https://www.johnlockeinstitute.com/essay-competition" target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline font-medium">John Locke Global Prize</a> | <a href="https://ukmt.org.uk/" target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline font-medium">UKMT Challenges</a>
                </p>
              </div>
              <div className="text-[11px] border-t border-stone-100 pt-2.5">
                <span className="font-bold text-[#1B365D] block mb-0.5 uppercase tracking-wider text-[9px]">Maths & STEM Prep:</span>
                <p className="text-[10px] text-stone-500 leading-normal">
                  <a href="https://step.maths.org/" target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline font-medium">STEP Support</a> | <a href="https://esat-tmua.ac.uk/" target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline font-medium">ESAT & TMUA Portal</a>
                </p>
              </div>
            </div>

            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono border-t border-stone-100 pt-4">
              ✦ G5 Elite Portals
            </p>

            <div className="space-y-3 pl-1 font-sans">
              <div className="text-[11px]">
                <a href="https://www.imperial.ac.uk/study/apply/undergraduate/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-900 hover:underline block mb-0.5">
                  Imperial College London study ➔
                </a>
                <p className="text-[10px] text-stone-500 leading-normal">
                  Undergraduate admissions. Focuses heavily on the quantitative ESAT/TMUA assessments.
                </p>
              </div>
              <div className="text-[11px] border-t border-stone-100 pt-2.5">
                <a href="https://www.lse.ac.uk/study-at-lse/undergraduate" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-900 hover:underline block mb-0.5">
                  LSE Undergraduate Admissions ➔
                </a>
                <p className="text-[10px] text-stone-500 leading-normal">
                  No interview process. Selection relies heavily on UCAS Personal Statement rigor.
                </p>
              </div>
              <div className="text-[11px] border-t border-stone-100 pt-2.5">
                <a href="https://www.ucl.ac.uk/study/undergraduate" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-900 hover:underline block mb-0.5">
                  UCL Study & Admissions ➔
                </a>
                <p className="text-[10px] text-stone-500 leading-normal">
                  Broad interdisciplinary study, requires strong analytical-humanities writing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Panel & Interactive Audit Checklist */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === "chapters" ? (
            activeChapterData ? (
              <>
                {/* Main Chapter Content Card (High-End Newspaper Reading Block) */}
                <div className="bg-[#FDFBF9] p-8 sm:p-12 rounded border border-stone-200/80 shadow-sm flex flex-col justify-between min-h-[400px]">
                  <div>
                    <div className="text-[10px] text-stone-500 font-bold uppercase tracking-widest border-b border-stone-100 pb-2 mb-6 flex justify-between items-center font-mono">
                      <span>Active Milestone Focus</span>
                      <span>{activeChapterFocus.split(" ")[0] || "Ch " + activeChapterData.num}</span>
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mb-6 leading-tight tracking-tight border-b-2 border-double border-stone-200 pb-4">
                      Chapter {activeChapterData.num}: {activeChapterTitle.replace(/^Chapter\s*\d+:\s*/i, '')}
                    </h2>
                    
                    <h3 className="text-xs font-bold text-stone-500 mb-6 uppercase tracking-widest font-mono">
                      {activeChapterFocus}
                    </h3>

                    {/* Reading Canvas: Serif, justified, Drop-cap in the first paragraph */}
                    <div className="font-serif text-stone-850 text-base md:text-[17px] leading-relaxed md:leading-loose text-[#33312E] space-y-6 max-w-2xl mx-auto">
                      {parseMarkdown(activeChapterText)}
                    </div>
                  </div>
                  
                  {/* Academic Citation Footer (Muted Scholarly Citation) */}
                  <div className="border-t border-stone-200 pt-6 mt-10 bg-[#FAF8F5] p-5 rounded border border-stone-200/50">
                    <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2.5 font-mono">📌 Academic Citation (Harvard Style)</h4>
                    <div className="space-y-2">
                      {activeChapterRef.split('\n').filter(Boolean).map((line, rIdx) => renderReferenceLine(line, rIdx))}
                    </div>
                  </div>
                </div>

                {/* Interactive Self-Awareness Audit Checklist (Clean Editorial Appendix) */}
                {AUDIT_ITEMS[activeChapterData.num] && (
                  <div className="bg-[#FAF8F5] text-stone-800 p-8 rounded border border-stone-200 shadow-sm">
                    <div className="flex justify-between items-center border-b border-stone-200 pb-3 mb-5">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#1B365D] font-mono flex items-center gap-2">
                        <span>🧠 Metacognitive Progress Check</span>
                      </h3>
                      <span className="text-[10px] bg-stone-200 text-stone-700 font-mono px-2 py-0.5 rounded">
                        Ch {activeChapterData.num} Appendix
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 italic mb-5">
                      Read the diagnostic criteria below and toggle checkboxes to log your own self-directed study trajectory:
                    </p>
                    <div className="space-y-3 font-sans">
                      {AUDIT_ITEMS[activeChapterData.num].map((item, idx) => {
                        const isChecked = !!checkedItems[`${activeChapterData.num}-${idx}`];
                        return (
                          <div 
                            key={idx} 
                            onClick={() => handleCheckboxChange(activeChapterData.num, idx)}
                            className={`flex items-start gap-3.5 p-3.5 rounded border cursor-pointer transition duration-150 ${
                              isChecked 
                                ? 'bg-white border-stone-400 shadow-inner' 
                                : 'bg-white/40 border-stone-200 hover:bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // Controlled by outer div click
                              className="mt-0.5 rounded border-stone-300 text-[#1B365D] focus:ring-[#1B365D]"
                            />
                            <p className="text-xs leading-relaxed text-stone-700 select-none">
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
              <div className="bg-white p-12 rounded border border-stone-200 shadow-sm text-center font-serif">
                <span className="text-4xl block mb-3">🔍</span>
                <p className="text-stone-500 text-sm italic">
                  Select a chapter from the list or clear your search to explore the Strategic Admissions Guide.
                </p>
              </div>
            )
          ) : (
            /* Living Journal Content Card */
            JOURNAL_DATA[activeJournalIdx] ? (
              <div className="bg-[#FDFBF9] p-8 sm:p-12 rounded border border-stone-200/80 shadow-sm flex flex-col justify-between min-h-[400px]">
                <div>
                  <div className="text-[10px] text-stone-500 font-bold uppercase tracking-widest border-b border-stone-100 pb-2 mb-6 flex justify-between items-center font-mono">
                    <span>Journal Entry Log</span>
                    <span>{JOURNAL_DATA[activeJournalIdx].date}</span>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mb-6 leading-tight tracking-tight border-b-2 border-double border-stone-200 pb-4">
                    📅 Entry: {JOURNAL_DATA[activeJournalIdx].date}
                  </h2>

                  {/* Reading Canvas for Journal Entry: Serif, justified */}
                  <div className="font-serif text-stone-850 text-base md:text-[17px] leading-relaxed md:leading-loose text-[#33312E] space-y-6 max-w-2xl mx-auto">
                    {parseMarkdown(JOURNAL_DATA[activeJournalIdx].content)}
                  </div>
                </div>
                
                {/* Academic Citation Footer (Muted Scholarly Citation) */}
                <div className="border-t border-stone-200 pt-6 mt-10 bg-[#FAF8F5] p-5 rounded border border-stone-200/50">
                  <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 font-mono">📌 System Event Information</h4>
                  <p className="text-xs text-stone-600 font-sans leading-relaxed italic">
                    This journal entry was synchronized directly from your local OpenClaw workspace memories on {JOURNAL_DATA[activeJournalIdx].date}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded border border-stone-200 shadow-sm text-center font-serif">
                <span className="text-4xl block mb-3">📝</span>
                <p className="text-stone-500 text-sm italic">
                  Select a journal log from the timeline on the left to review daily progress.
                </p>
              </div>
            )
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#FAF8F5] border-t border-stone-200 py-8 text-center text-[10px] text-stone-400 font-mono uppercase tracking-widest">
        The Pathway to the Spires © 2026. All Rights Reserved. Produced locally via i9 + RTX 4080 Home Server.
      </footer>
    </div>
  );
}

export default App;

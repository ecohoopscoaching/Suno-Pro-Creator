
import React, { useState, useMemo, useCallback } from 'react';
import { 
  Music, 
  Copy, 
  CheckCircle, 
  Sparkles, 
  Info, 
  ChevronDown, 
  Upload, 
  X, 
  Zap, 
  Layout, 
  Layers, 
  Mic2, 
  MonitorPlay,
  RotateCcw,
  GitMerge
} from 'lucide-react';
import { TOPICS, RAPPERS, SINGERS, PRODUCERS, RHYME_SCHEMES } from './constants';
import { generateSunoLyrics } from './geminiService';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedVocalist, setSelectedVocalist] = useState('');
  const [selectedProducer, setSelectedProducer] = useState('');
  const [selectedRhymeScheme, setSelectedRhymeScheme] = useState('');
  const [customStyle, setCustomStyle] = useState('');
  const [lyrics, setLyrics] = useState('');
  
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedStyle, setCopiedStyle] = useState(false);
  const [copiedLyrics, setCopiedLyrics] = useState(false);
  
  const [showRules, setShowRules] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Grouped options for UI organization
  const topicCategories = useMemo(() => {
    const categories: { [key: string]: string[] } = {
      "CORE CONCEPTS": ["Ecological Dynamics", "Ecological Psychology", "Dynamical Systems Theory", "Growth Mindset"],
      "DREAMS & PURPOSE": ["Dreams", "Hoop Dreams", "Temptation"],
      "LOVE & RELATIONSHIPS": ["Love", "Lust", "Heartbreak", "Friendship", "Family", "Outgrowing Friendships"],
      "IDENTITY & SELF": ["Living in the Moment", "Being True to Yourself", "Never Forgetting Where You Come From", "Your Past", "Your Future", "The 'Mask' We Wear", "Finding Home"],
      "STRUGGLE & GROWTH": ["The Struggle", "Rags to Riches", "The Second Wind", "Growth", "Regret"],
      "BASKETBALL & SPORTS": ["NBA Superstars (90s)", "NBA Superstars (00s)", "NBA Superstars (Today)", "WNBA Superstars (00s)", "WNBA Superstars (Today)", "Girl Power"],
      "STREET LIFE & REALITY": ["Street Life", "The Jungle"],
      "PHILOSOPHY & WISDOM": ["Mindfulness", "Zen Philosophy", "Zen Stillness", "Silence/Stillness", "Metaphors for Life", "The Wisdom in 'Foolish' Questions"],
      "TIME & LIFE LESSONS": ["Time is the Only Currency", "The 'Auto-Pilot' Trap", "The Weight of 'What If?'", "Legacy", "Gratitude"],
      "FAMILY & FORGIVENESS": ["Forgiving Your Parents", "Forgiving the Unapologetic", "Generational Trauma", "The Debt to Your Younger Self"],
      "MODERN LIFE": ["Learning to Say 'No'", "The Right to Be Heard", "Digital Control", "Social Media vs. Reality", "Imposter Syndrome"],
      "SUCCESS & AMBITION": ["The Cost of Ambition", "Losing a Hero"],
      "NATURE & ANIMALS": ["Animals", "Reptiles", "Dogs", "Cats"],
      "TRIBUTE & MEMORY": ["Autobiography", "Dedication (RIP)"],
      "COMMUNICATION": ["Learning to Listen"]
    };
    return categories;
  }, []);

  const rhymeSchemeCategories = useMemo(() => {
    return {
      "TIER 1: BASICS": ["The Nursery Rhyme (AABB)", "The Standard (ABAB)", "The Sandwich (ABBA)"],
      "TIER 2: TECHNICIAN": ["The Inception (Internal)", "The Baton Pass (Chain)", "The Machine Gun (Mono-Rhyme)"],
      "TIER 3: GOD MODE": ["The Big Pun (Multis)", "The Bender (Broken Rhyme)"],
      "TIER 4: THE ARCHITECT": ["The Jigsaw (Mosaic)", "The Bookends (Framed)", "The Countdown (Climbing)"],
      "TIER 5: ABSTRACT": ["The Doppelgänger (Holorime)", "The Jay-Z Pivot (Antanaclasis)", "The Spillover (Across-the-Bar)"],
      "TIER 6: HIGH CONCEPT": ["The Count (Numerical Progression)", "The Rewind (Reverse Chronology)", "The Possessed (Object POV)", "The ABCs (Alphabet Aerobics)", "The Hammer (Anaphora)", "The Missing Link (No 'I' or 'Me')"],
      "ABSTRACT": ["The Jazz Poet (Free Verse)"]
    };
  }, []);

  const cleanPromptTags = (str: string) => {
    // Removes bracketed labels and returns just the tag content separated by commas
    // e.g. "[Production: Lo-Fi, Beats] [Mood: Chill]" -> "Lo-Fi, Beats, Chill"
    return str
      .split(']')
      .filter(p => p.trim())
      .map(p => {
        const parts = p.split(':');
        return parts.length > 1 ? parts[1].trim() : p.replace('[', '').trim();
      })
      .join(', ');
  };

  const stylePrompt = useMemo(() => {
    const sections: string[] = [];
    
    // 1. Producer Style (Genre, sonic characteristics)
    if (selectedProducer) {
      sections.push(cleanPromptTags(PRODUCERS[selectedProducer]));
    }
    
    // 2. Vocalist/Rapper (Vocal profile + techniques)
    if (selectedVocalist) {
      const vocalistData = RAPPERS[selectedVocalist] || SINGERS[selectedVocalist];
      sections.push(cleanPromptTags(vocalistData));
    }

    // 3. Custom Elements
    if (customStyle.trim()) {
      sections.push(customStyle.trim());
    }

    // Note: Rhyme schemes are typically handled within lyric formatting/LLM prompt, 
    // but if the user wants them in the style tags too:
    if (selectedRhymeScheme) {
      sections.push(cleanPromptTags(RHYME_SCHEMES[selectedRhymeScheme]));
    }
    
    return sections.join(', ');
  }, [selectedVocalist, selectedProducer, selectedRhymeScheme, customStyle]);

  const handleTopicSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedTopic(val);
    if (val) {
      setTopic(val);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setTopic(`Analysis of: ${file.name}`);
      setSelectedTopic('');
    }
  };

  const handleReset = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all inputs and start over?")) {
      setTopic('');
      setSelectedTopic('');
      setUploadedFile(null);
      setSelectedVocalist('');
      setSelectedProducer('');
      setSelectedRhymeScheme('');
      setCustomStyle('');
      setLyrics('');
      setCopiedAll(false);
      setCopiedStyle(false);
      setCopiedLyrics(false);
    }
  }, []);

  const handleGenerate = async () => {
    if (!topic || !selectedVocalist) {
      alert("Please define a topic and select a vocalist persona.");
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await generateSunoLyrics({
        topic,
        topicDescription: TOPICS[topic],
        vocalist: selectedVocalist,
        vocalistDetail: RAPPERS[selectedVocalist] || SINGERS[selectedVocalist],
        producer: selectedProducer,
        producerDetail: PRODUCERS[selectedProducer],
        rhymeScheme: selectedRhymeScheme,
        rhymeSchemeDetail: RHYME_SCHEMES[selectedRhymeScheme],
        customStyle
      });
      setLyrics(generated);
    } catch (error) {
      alert("Generation failed. Check console or API key settings.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = useCallback((text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 selection:bg-indigo-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-12">
        <header className="flex flex-col items-center mb-12 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
            <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium tracking-wide text-purple-200">AI-POWERED PROMPT ENGINE</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-300">
            Suno Pro Creator
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
            Craft high-fidelity prompts and lyrics with surgically precise musical syntax.
            Engineered for Suno's advanced generation model.
          </p>

          <div className="mt-6 flex items-center gap-4">
            <button 
              onClick={() => setShowRules(!showRules)}
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium"
            >
              <Info className="w-4 h-4" />
              {showRules ? 'Hide Rules' : 'Show Formatting Syntax'}
            </button>
            <div className="w-px h-4 bg-white/10"></div>
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Reset App
            </button>
          </div>
        </header>

        {showRules && (
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-3xl p-8 mb-12 backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layout className="w-5 h-5 text-indigo-400" />
                  Structure Syntax
                </h3>
                <ul className="space-y-3 text-sm text-indigo-100/70">
                  <li><code className="text-indigo-300 px-1 py-0.5 bg-indigo-500/10 rounded">[Intro: Mood]</code> - Sets the starting atmosphere</li>
                  <li><code className="text-indigo-300 px-1 py-0.5 bg-indigo-500/10 rounded">[Verse: Delivery]</code> - Changes vocal technique mid-song</li>
                  <li><code className="text-indigo-300 px-1 py-0.5 bg-indigo-500/10 rounded">[Chorus: Energy]</code> - Peaks the melodic intensity</li>
                  <li><code className="text-indigo-300 px-1 py-0.5 bg-indigo-500/10 rounded">[Outro: Fade]</code> - Smooth transitions to the end</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Vocal Guiding
                </h3>
                <ul className="space-y-3 text-sm text-indigo-100/70">
                  <li><strong className="text-indigo-200">Rap Flow:</strong> Use <code className="text-indigo-300">hyphens-between-words</code> for tight rhythm</li>
                  <li><strong className="text-indigo-200">Singing:</strong> Use <code className="text-indigo-300">ellipses...</code> for sustained notes</li>
                  <li><strong className="text-indigo-200">Ad-libs:</strong> Place in <code className="text-indigo-300">(parentheses)</code> for backing layers</li>
                  <li><strong className="text-indigo-200">Breaks:</strong> Use <code className="text-indigo-300">( . . . )</code> for instrumental solo sections</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                  <MonitorPlay className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold">Concept & Topic</h2>
              </div>
              
              <div className="space-y-5">
                <div className="relative">
                  <select 
                    value={selectedTopic} 
                    onChange={handleTopicSelect}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="">Select a Curated Topic...</option>
                    {(Object.entries(topicCategories) as [string, string[]][]).map(([cat, topics]) => (
                      <optgroup key={cat} label={cat} className="bg-gray-900">
                        {topics.map(t => <option key={t} value={t}>{t}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                <div className="relative">
                  <textarea
                    value={topic}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      setSelectedTopic('');
                    }}
                    placeholder="Describe your song theme or paste a custom topic..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none"
                  />
                  {TOPICS[topic] && (
                    <div className="mt-3 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 italic text-xs text-indigo-200/80 leading-relaxed">
                      "{TOPICS[topic]}"
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <label className="flex items-center justify-center gap-3 w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 cursor-pointer transition-all active:scale-95">
                    <input type="file" onChange={handleFileUpload} className="hidden" />
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">
                      {uploadedFile ? uploadedFile.name : 'Inspiration File (PDF/EPUB)'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                  <Mic2 className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold">Vocal & Production</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Producer Style</label>
                  <div className="relative">
                    <select 
                      value={selectedProducer} 
                      onChange={(e) => setSelectedProducer(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                    >
                      <option value="">Select a Producer...</option>
                      {Object.keys(PRODUCERS).map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Vocalist Persona</label>
                  <div className="relative">
                    <select 
                      value={selectedVocalist} 
                      onChange={(e) => setSelectedVocalist(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                    >
                      <option value="">Select a Voice...</option>
                      <optgroup label="RAPPERS" className="bg-gray-900">
                        {Object.keys(RAPPERS).map(name => <option key={name} value={name}>{name}</option>)}
                      </optgroup>
                      <optgroup label="SINGERS" className="bg-gray-900">
                        {Object.keys(SINGERS).map(name => <option key={name} value={name}>{name}</option>)}
                      </optgroup>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                    <GitMerge className="w-3 h-3" />
                    Rhyme Scheme & Constraints
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedRhymeScheme} 
                      onChange={(e) => setSelectedRhymeScheme(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                    >
                      <option value="">Standard / Flexible Rhyming...</option>
                      {(Object.entries(rhymeSchemeCategories) as [string, string[]][]).map(([cat, schemes]) => (
                        <optgroup key={cat} label={cat} className="bg-gray-900">
                          {schemes.map(s => <option key={s} value={s}>{s}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                  {selectedRhymeScheme && (
                    <div className="mt-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10 italic text-[10px] text-purple-200/80 leading-snug">
                      {RHYME_SCHEMES[selectedRhymeScheme]}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Custom Style Hooks</label>
                  <input
                    type="text"
                    value={customStyle}
                    onChange={(e) => setCustomStyle(e.target.value)}
                    placeholder="Vinyl, 808s, Reverb, Melancholy..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Suno Style Prompt</span>
                <button 
                  onClick={() => copyToClipboard(stylePrompt, setCopiedStyle)}
                  disabled={!stylePrompt}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] transition-all"
                >
                  {copiedStyle ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedStyle ? 'Copied' : 'Copy Style'}
                </button>
              </div>
              <p className="font-mono text-[11px] text-gray-300 break-words leading-relaxed">
                {stylePrompt || 'Prompt will appear here as you select personas...'}
              </p>
            </div>
          </section>

          <section className="lg:col-span-7 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full min-h-[600px] shadow-2xl backdrop-blur-md">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                    <Layout className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-bold">Lyric Composition</h2>
                </div>
                <div className="flex items-center gap-2">
                  {lyrics && (
                    <button 
                      onClick={() => copyToClipboard(lyrics, setCopiedLyrics)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs flex items-center gap-2"
                    >
                      {copiedLyrics ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      {copiedLyrics ? 'Copied' : 'Copy Lyrics'}
                    </button>
                  )}
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                  >
                    {isGenerating ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {isGenerating ? 'Generating...' : 'Compose Lyrics'}
                  </button>
                </div>
              </div>

              <div className="flex-1 relative">
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  className="w-full h-full bg-transparent p-8 font-mono text-sm text-indigo-100 placeholder-indigo-100/20 focus:outline-none resize-none leading-relaxed"
                  placeholder={`[Intro: Gritty Street Noise]
(Yeah... it's like this...)

[Verse 1: Fast Rap]
The-rhythm-is-the-reason-that-I-stand-on-my-own
Concrete-jungle-calling-on-a-frequency-alone...

[Chorus: Soulful Belting]
Waitiiiing... for a change to come around...
Rising... higher... from the cold-dark-ground...`}
                />
              </div>

              <div className="p-4 bg-black/20 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Rap Key</span>
                  <span className="text-[10px] text-indigo-300">hyphen-ated-flow</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Soul Key</span>
                  <span className="text-[10px] text-indigo-300">sustaaaained... note</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Layer Key</span>
                  <span className="text-[10px] text-indigo-300">(backing vocals)</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Break Key</span>
                  <span className="text-[10px] text-indigo-300">( . . . ) pause</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        <div className="mt-12 flex justify-center">
          <button
            onClick={() => copyToClipboard(`STYLE PROMPT:\n${stylePrompt}\n\nLYRICS:\n${lyrics}`, setCopiedAll)}
            disabled={!lyrics}
            className="group relative inline-flex items-center gap-4 px-12 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right text-white font-bold text-xl rounded-full shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            {copiedAll ? (
              <>
                <CheckCircle className="w-6 h-6 animate-bounce" />
                Copied Full Project!
              </>
            ) : (
              <>
                <Copy className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                Copy Final Master Prompt
              </>
            )}
          </button>
        </div>

        <footer className="mt-20 pt-10 border-t border-white/5 text-center text-gray-500 text-xs">
          <p className="mb-2">Suno Pro Creator v2.4 • Expert-Level Music Prompt Engineering</p>
          <p>© 2024 Gemini Audio Dynamics • Generated content optimized for Suno AI Version 3+</p>
        </footer>
      </div>
    </div>
  );
};

export default App;

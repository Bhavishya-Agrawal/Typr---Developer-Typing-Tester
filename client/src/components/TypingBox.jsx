import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getRandomSnippetApi, saveResultApi } from '../services/api';
import ResultsModal from './ResultsModal';
import { RotateCcw, ArrowRight, Play, Terminal } from 'lucide-react';

const FALLBACK_SNIPPETS = {
  python: 'def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)',
  javascript: 'function binarySearch(arr, target) {\n    let left = 0;\n    let right = arr.length - 1;\n    while (left <= right) {\n        const mid = Math.floor((left + right) / 2);\n        if (arr[mid] === target) return mid;\n        if (arr[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}',
  java: 'public class Solution {\n    public static int maxSubArray(int[] nums) {\n        int maxSoFar = nums[0];\n        int currMax = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            currMax = Math.max(nums[i], currMax + nums[i]);\n            maxSoFar = Math.max(maxSoFar, currMax);\n        }\n        return maxSoFar;\n    }\n}',
  cpp: '#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> numbers = {1, 2, 3, 4, 5};\n    for (const auto& num : numbers) {\n        std::cout << "Value: " << num << "\\n";\n    }\n    return 0;\n}'
};

const LANGUAGES = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' }
];

const MODES = [
  { id: 'snippet', label: 'Snippet' },
  { id: 'time', label: 'Time' },
  { id: 'words', label: 'Words' }
];

const TIME_OPTIONS = [15, 30, 60];
const WORD_OPTIONS = [30, 50, 100];

const TypingBox = () => {
  // Test Options
  const [lang, setLang] = useState('python');
  const [mode, setMode] = useState('snippet');
  const [timeLimit, setTimeLimit] = useState(30);
  const [wordLimit, setWordLimit] = useState(50);

  // Engine State
  const [snippet, setSnippet] = useState('');
  const [input, setInput] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [results, setResults] = useState(null);
  const [loadingSnippet, setLoadingSnippet] = useState(false);

  const containerRef = useRef(null);
  const timerRef = useRef(null);

  // Load Snippet from API with fallback
  const fetchSnippet = useCallback(async (selectedLang, selectedMode, tLimit, wLimit) => {
    setLoadingSnippet(true);
    try {
      let bucket = 'words30';
      if (selectedMode === 'words') bucket = `words${wLimit}`;
      else if (selectedMode === 'snippet') {
        const buckets = ['words30', 'words50', 'words100'];
        bucket = buckets[Math.floor(Math.random() * buckets.length)];
      }

      const res = await getRandomSnippetApi({
        language: selectedLang,
        bucket,
        mode: selectedMode,
        targetWords: selectedMode === 'time' ? (tLimit === 15 ? 60 : tLimit === 30 ? 120 : 200) : undefined
      });

      if (res && res.data && res.data.code) {
        setSnippet(res.data.code);
      } else {
        setSnippet(FALLBACK_SNIPPETS[selectedLang] || FALLBACK_SNIPPETS.python);
      }
    } catch (err) {
      console.warn('[TypingBox]: API fallback used for snippet:', err.message);
      setSnippet(FALLBACK_SNIPPETS[selectedLang] || FALLBACK_SNIPPETS.python);
    } finally {
      setLoadingSnippet(false);
    }
  }, []);

  // Reset Session
  const resetSession = useCallback(
    (reloadSnippet = true) => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setInput('');
      setCharIndex(0);
      setStartedAt(null);
      setElapsedSeconds(0);
      setTotalKeystrokes(0);
      setCorrectKeystrokes(0);
      setResults(null);

      if (reloadSnippet) {
        fetchSnippet(lang, mode, timeLimit, wordLimit);
      }
    },
    [fetchSnippet, lang, mode, timeLimit, wordLimit]
  );

  // Initial load or configuration change
  useEffect(() => {
    resetSession(true);
  }, [lang, mode, timeLimit, wordLimit]);

  // Handle completion
  const handleComplete = useCallback(
    async (finalElapsed) => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;

      const duration = finalElapsed || elapsedSeconds || 1;
      const minutes = duration / 60;
      const finalWpm = minutes > 0 ? Math.round(correctKeystrokes / 5 / minutes) : 0;
      const finalAccuracy =
        totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;

      const payload = {
        wpm: finalWpm,
        rawWpm: minutes > 0 ? Math.round(totalKeystrokes / 5 / minutes) : 0,
        accuracy: finalAccuracy,
        timeTaken: Math.max(1, Math.round(duration)),
        language: lang,
        mode,
        modeDetail: mode === 'time' ? `${timeLimit}s` : mode === 'words' ? `${wordLimit}w` : 'snippet',
        keystrokes: {
          total: totalKeystrokes,
          correct: correctKeystrokes,
          incorrect: Math.max(0, totalKeystrokes - correctKeystrokes)
        }
      };

      try {
        await saveResultApi(payload);
        payload.saved = true;
      } catch (err) {
        console.warn('[TypingBox]: Failed to save result to backend:', err.message);
        payload.saved = false;
      }

      setResults(payload);
    },
    [elapsedSeconds, correctKeystrokes, totalKeystrokes, lang, mode, timeLimit, wordLimit]
  );

  // Real-time Timer
  useEffect(() => {
    if (!startedAt || results) return;

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startedAt) / 1000;
      setElapsedSeconds(elapsed);

      if (mode === 'time' && elapsed >= timeLimit) {
        handleComplete(timeLimit);
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startedAt, mode, timeLimit, results, handleComplete]);

  // Global Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (results) return;

      // Shortcut: Tab + Enter or Escape restarts
      if (e.key === 'Escape') {
        e.preventDefault();
        resetSession(true);
        return;
      }

      // Ignore modifiers alone
      if (['Control', 'Alt', 'Meta', 'Shift', 'CapsLock'].includes(e.key)) return;

      // Start timer on first keypress
      if (!startedAt) {
        setStartedAt(Date.now());
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (charIndex > 0) {
          setInput((prev) => prev.slice(0, -1));
          setCharIndex((prev) => prev - 1);
        }
        return;
      }

      // Prevent scrolling / default tab
      if (['Tab', ' '].includes(e.key)) {
        e.preventDefault();
      }

      let typedStr = e.key;

      if (e.key === 'Enter') {
        e.preventDefault();
        // Smart indentation: inspect current line
        const lastNewLine = input.lastIndexOf('\n');
        const currentLine = input.slice(lastNewLine === -1 ? 0 : lastNewLine + 1);
        let indent = '';
        const match = currentLine.match(/^[ \t]*/);
        if (match) indent = match[0];
        if (currentLine.trimEnd().endsWith(':') || currentLine.trimEnd().endsWith('{')) {
          indent += '    ';
        }
        typedStr = '\n' + indent;
      } else if (e.key === 'Tab') {
        typedStr = '    ';
      }

      if (typedStr.length > 0) {
        const nextInput = input + typedStr;
        const nextIndex = charIndex + typedStr.length;

        // Check correctness of this input
        let addedCorrect = 0;
        for (let i = 0; i < typedStr.length; i++) {
          const currentExpected = snippet[charIndex + i];
          if (typedStr[i] === currentExpected) {
            addedCorrect++;
          }
        }

        setTotalKeystrokes((prev) => prev + typedStr.length);
        setCorrectKeystrokes((prev) => prev + addedCorrect);
        setInput(nextInput);
        setCharIndex(nextIndex);

        // Check completion condition
        if (mode === 'snippet' && nextIndex >= snippet.length) {
          const elapsed = startedAt ? (Date.now() - startedAt) / 1000 : 1;
          handleComplete(elapsed);
        } else if (mode === 'words') {
          const wordsTyped = nextInput.trim().split(/\s+/).filter(Boolean).length;
          if (wordsTyped >= wordLimit) {
            const elapsed = startedAt ? (Date.now() - startedAt) / 1000 : 1;
            handleComplete(elapsed);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    results,
    startedAt,
    charIndex,
    input,
    snippet,
    mode,
    wordLimit,
    resetSession,
    handleComplete
  ]);

  // Compute live metrics
  const minutesElapsed = elapsedSeconds / 60;
  const currentWpm =
    minutesElapsed > 0 ? Math.round(correctKeystrokes / 5 / minutesElapsed) : 0;
  const currentAcc =
    totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;

  const displayTime =
    mode === 'time'
      ? `${Math.max(0, Math.ceil(timeLimit - elapsedSeconds))}s`
      : `${Math.floor(elapsedSeconds)}s`;

  return (
    <div className="workstation-container" ref={containerRef}>
      <div className="workstation-card">
        {/* Top Control Toolbar */}
        <div className="workstation-toolbar">
          {/* Mode Selector Chips */}
          <div className="chip-cluster">
            {MODES.map((m) => (
              <button
                key={m.id}
                className={`chip ${mode === m.id ? 'active' : ''}`}
                onClick={() => setMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Sub-options for Time / Words */}
          {mode === 'time' && (
            <div className="chip-cluster">
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  className={`chip ${timeLimit === t ? 'active' : ''}`}
                  onClick={() => setTimeLimit(t)}
                >
                  {t}s
                </button>
              ))}
            </div>
          )}

          {mode === 'words' && (
            <div className="chip-cluster">
              {WORD_OPTIONS.map((w) => (
                <button
                  key={w}
                  className={`chip ${wordLimit === w ? 'active' : ''}`}
                  onClick={() => setWordLimit(w)}
                >
                  {w} words
                </button>
              ))}
            </div>
          )}

          {/* Language Selector Chips */}
          <div className="chip-cluster">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                className={`chip ${lang === l.id ? 'active' : ''}`}
                onClick={() => setLang(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Real-time Telemetry Pills */}
          <div className="telemetry-cluster">
            <div className="telemetry-pill">
              <span className="telemetry-label">WPM</span>
              <span className="telemetry-value">{currentWpm}</span>
            </div>
            <div className="telemetry-pill">
              <span className="telemetry-label">Acc</span>
              <span className="telemetry-value">{currentAcc}%</span>
            </div>
            <div className="telemetry-pill">
              <span className="telemetry-label">Time</span>
              <span className="telemetry-value">{displayTime}</span>
            </div>
          </div>
        </div>

        {/* Code Editor Window */}
        <div
          className="editor-window"
          tabIndex={0}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          {/* Header Bar */}
          <div className="editor-meta-header">
            <div className="window-dots">
              <span className="window-dot dot-red"></span>
              <span className="window-dot dot-amber"></span>
              <span className="window-dot dot-green"></span>
            </div>
            <span className="editor-tag">
              {lang} · {mode} {mode === 'time' ? `${timeLimit}s` : mode === 'words' ? `${wordLimit}w` : ''}
            </span>
          </div>

          {/* Monospace Code Display with Character-by-Character Validation */}
          {loadingSnippet ? (
            <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', padding: '2rem 0' }}>
              // Loading real-world snippet from database...
            </div>
          ) : (
            <div className="code-canvas">
              {snippet.split('').map((char, i) => {
                let statusClass = '';
                if (i < charIndex) {
                  statusClass = input[i] === char ? 'correct' : 'incorrect';
                } else if (i === charIndex) {
                  statusClass = 'current';
                }

                return (
                  <span key={i} className={`char ${statusClass}`}>
                    {char}
                  </span>
                );
              })}
            </div>
          )}

          {/* Overlay if click moved outside */}
          {!isFocused && !results && (
            <div className="unfocused-overlay" onClick={() => setIsFocused(true)}>
              <div className="unfocused-badge">
                <Play size={16} /> Click here to resume typing
              </div>
            </div>
          )}
        </div>

        {/* Workstation Footer Actions */}
        <div className="workstation-footer">
          <div className="shortcut-tip">
            <span>Press</span> <kbd className="kbd">Esc</kbd> <span>to restart snippet</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => resetSession(false)} className="btn-pill-ghost">
              <RotateCcw size={15} /> Restart
            </button>
            <button onClick={() => resetSession(true)} className="btn-pill-ghost">
              <ArrowRight size={15} /> Next Snippet
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary Modal */}
      {results && (
        <ResultsModal
          results={results}
          onRetry={() => resetSession(false)}
          onNext={() => resetSession(true)}
        />
      )}
    </div>
  );
};

export default TypingBox;

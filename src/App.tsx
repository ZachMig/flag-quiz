import { useEffect, useRef, useState } from "react";
import "./App.css";
import codesByPreset from "./assets/presetCountries.json";
import QuizUI from "./components/QuizUI";

// https://vite.dev/guide/features#glob-import for reference of importing flag SVG files
function App() {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [shuffledPrompts, setShuffledPrompts] = useState<string[]>([]);
  const [gameReady, setGameReady] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(true);
  const [activePresets, setActivePresets] = useState<Map<string, boolean>>(
    new Map()
  );
  // const [selectedCountryCodes, setSelectedCountryCodes] = useState<Set<string>>(
  //   new Set()
  // );
  const menuOpenRef = useRef(true);
  const codesByPresetMap: Record<string, string[]> = codesByPreset;
  const presets = [
    "Americas",
    "Europe",
    "Asia",
    "Middle East",
    "Africa",
    "OCE",
    "GeoGuessr",
    "Islands",
  ];

  // Shuffle selected prompts ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const shufflePrompts = () => {
    // Fisher-Yates Shuffle

    console.log("Shuffling prompts.");

    const promptsCopy = [...prompts];
    for (let i = promptsCopy.length - 1; i >= 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = promptsCopy[j];
      promptsCopy[j] = promptsCopy[i];
      promptsCopy[i] = temp;
    }

    setShuffledPrompts(promptsCopy);
    // setGameReady(true);
    // console.log("Shuffled original [0] = " + shuffledPrompts[0]);

    // console.log("Shuffled [0] = " + shuffledPrompts[0]);
  };

  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  useEffect(() => {
    if (shuffledPrompts && shuffledPrompts.length > 0) {
      setGameReady(true);
    }
  }, [shuffledPrompts]);

  useEffect(() => {
    if (prompts && prompts.length > 0) {
      shufflePrompts();
    }
  }, [prompts]);

  useEffect(() => {
    const defaultPresets: Map<string, boolean> = new Map();

    for (const preset of presets) {
      defaultPresets.set(preset, false);
    }

    // Temp prompts for testing
    // setPrompts(["cu", "ch", "ua", "um", "ru", "de", "jp"]);
  }, []);

  const handleMenuClick = () => {
    console.log("Menu Clicked! Current state: " + menuOpenRef.current);
    if (menuOpenRef.current) {
      setMenuOpen(false);
    } else {
      setMenuOpen(true);
    }
  };

  const handlePresetSelect = (preset: string) => {
    console.log("Selecting preset " + preset);
    const newPresets: Map<string, boolean> = new Map(activePresets);

    if (newPresets.get(preset) === true) {
      newPresets.set(preset, false);
    } else {
      newPresets.set(preset, true);
    }

    setActivePresets(newPresets);
  };

  const startGame = () => {
    const selectedCountryCodes = new Set<string>();

    for (const preset of presets) {
      if (activePresets.get(preset) === true) {
        for (const countryCode of codesByPresetMap[preset]) {
          selectedCountryCodes.add(countryCode);
        }
      }
    }

    setPrompts([...selectedCountryCodes]);
    setMenuOpen(false);
  };

  return (
    <>
      <div className="burger-box" onClick={handleMenuClick}>
        <div className="burger-line"></div>
        <div className="burger-line"></div>
        <div className="burger-line"></div>
      </div>
      {menuOpen && (
        <div className="menu-modal-background">
          <div className="menu-modal-container">
            <h1>Flag Quiz</h1>
            <div className="preset-option-list">
              {presets.map((preset) => (
                <button
                  className={`preset-option 
                    ${
                      activePresets.get(preset) === true ? "active-preset" : ""
                    }`}
                  onClick={() => handlePresetSelect(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
          <button onClick={startGame}>Start Game</button>
        </div>
      )}
      <div className="app-container">
        {gameReady && <QuizUI selectedCountryCodes={shuffledPrompts} />}
      </div>
    </>
  );
}

export default App;

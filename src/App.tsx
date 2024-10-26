import { useEffect, useRef, useState } from "react";
import "./App.css";
import codesByPreset from "./assets/presetCountries.json";
import QuizUI from "./components/QuizUI";

// https://vite.dev/guide/features#glob-import for reference of importing flag SVG files
function App() {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [shuffledPrompts, setShuffledPrompts] = useState<string[]>([]);
  const [gameReady, setGameReady] = useState<boolean>(false);
  const [gameInProgress, setGameInProgress] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(true);
  const [activePresets, setActivePresets] = useState<Map<string, boolean>>(
    new Map()
  );
  // const [selectedCountryCodes, setSelectedCountryCodes] = useState<Set<string>>(
  //   new Set()
  // );
  const menuOpenRef = useRef(true);
  const gameInProgressRef = useRef(false);
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
  };

  // MenuOpenRef
  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  // GameInProgressRef
  useEffect(() => {
    gameInProgressRef.current = gameInProgress;
  }, [gameInProgress]);

  // Set game ready once prompts have been shuffled and exist!
  useEffect(() => {
    if (shuffledPrompts && shuffledPrompts.length > 0) {
      setGameReady(true);
    }
  }, [shuffledPrompts]);

  // Once prompts are generated, shuffle them
  useEffect(() => {
    if (prompts && prompts.length > 0) {
      shufflePrompts();
    }
  }, [prompts]);

  // Setup game on component load
  useEffect(() => {
    const defaultPresets: Map<string, boolean> = new Map();
    document.addEventListener("keydown", handleKeyDown);

    for (const preset of presets) {
      defaultPresets.set(preset, false);
    }

    setActivePresets(defaultPresets);
  }, []);

  // Toggle menu on Keyboard Escape press
  const handleKeyDown = (event: KeyboardEvent) => {
    event.preventDefault();

    if (event.key === "Escape") {
      handleMenuToggle();
    }
  };

  // Handle Hamburger Menu click ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const handleMenuToggle = () => {
    console.log("Menu Toggled! Current state: " + menuOpenRef.current);

    if (gameInProgressRef.current === false) {
      console.log("Cannot close menu when inbetween games.");
      return;
    }

    if (menuOpenRef.current) {
      setMenuOpen(false);
    } else {
      setMenuOpen(true);
    }
  };

  const handlePresetSelect = (preset: string) => {
    console.log("Toggling preset " + preset);
    const newPresets: Map<string, boolean> = new Map(activePresets);

    newPresets.set(preset, !newPresets.get(preset));

    // for (const p of newPresets.keys()) {
    //   console.log(p + ": " + newPresets.get(p));
    // }

    setActivePresets(newPresets);
  };

  const startGame = () => {
    console.log("Start Game called");

    for (const p of activePresets.keys()) {
      console.log(p + ": " + activePresets.get(p));
    }

    let isAnyPresetSelected = false;
    for (const presetActive of activePresets.values()) {
      if (presetActive === true) {
        isAnyPresetSelected = true;
        break;
      }
    }

    if (!isAnyPresetSelected) {
      console.log("User attempted to start game with no selected presets.");
      return;
    }

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
    setGameInProgress(true);
  };

  const endGame = () => {
    console.log("End Game called");

    setMenuOpen(true);
    setGameInProgress(false);
  };

  return (
    <>
      <div className="burger-box" onClick={handleMenuToggle}>
        <div className="burger-line"></div>
        <div className="burger-line"></div>
        <div className="burger-line"></div>
      </div>
      {menuOpen && (
        <div className="menu-modal-background">
          <div className="menu-modal-container">
            <h1>Flag Quiz</h1>
            <h4>Select One or More Presets to Play.</h4>
            <div className="preset-option-list">
              {presets.map((preset) => (
                <button
                  key={preset}
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
          <div className="start-container">
            <button className="start-button" onClick={startGame}>
              {gameInProgress ? "Res" : "S"}tart Game
            </button>
          </div>
        </div>
      )}
      <div className="app-container">
        {gameReady && (
          <QuizUI
            selectedCountryCodes={shuffledPrompts}
            handleGameEnd={endGame}
          />
        )}
      </div>
    </>
  );
}

export default App;

import { useEffect, useMemo, useRef, useState } from "react";
import countries from "../assets/countries.json";
import "../css/QuizUI.css";

interface QuizUIProps {
  selectedCountryCodes: string[];
  handleGameEnd: () => void;
}

// Component Start ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const QuizUI = ({ selectedCountryCodes, handleGameEnd }: QuizUIProps) => {
  const countryMap: Record<string, string> = countries;
  const [flagPaths, setFlagPaths] = useState<null | Map<String, string>>(null);
  const [countryCodeIndex, setCountryCodeIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [onSelectResponse, setOnSelectResponse] = useState<string>("");
  const [inbetweenRounds, setInbetweenRounds] = useState<boolean>(false);
  const [currentFlagPath, setCurrentFlagPath] = useState<string | undefined>(
    ""
  );
  const inbetweenRoundsRef = useRef<boolean>(false);

  const numChoices = Math.min(12, selectedCountryCodes.length);

  const modules: any = import.meta.glob("../assets/flags/*.svg", {
    eager: true,
  });

  // Generate file paths for SVG imports ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const getFlagPaths = async () => {
    const flagPaths: Map<string, string> = new Map();

    for (const countryCode of Object.keys(countryMap)) {
      const filePath = `../assets/flags/${countryCode}.svg`;

      if (modules[filePath]) {
        const module: any = await modules[filePath];

        flagPaths.set(countryCode, module.default);
      } else {
        console.log("Error loading flag SVG files to Vite.");
        return null;
      }
    }

    console.log("Getting " + flagPaths.size + " flag paths.");

    setFlagPaths(flagPaths);
  };

  // Generate options ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Return shuffled array of country codes including the correct one
  const options = useMemo(() => {
    console.log(
      "Generating options for index " +
        countryCodeIndex +
        ": " +
        selectedCountryCodes[countryCodeIndex]
    );

    // Set of country codes
    const optionsSet = new Set<string>();

    // Add the correct option
    optionsSet.add(selectedCountryCodes[countryCodeIndex]);

    // Generate bait options
    while (optionsSet.size < numChoices) {
      const index = Math.floor(Math.random() * selectedCountryCodes.length);
      optionsSet.add(selectedCountryCodes[index]);
    }

    // Change set into arr to shuffle
    const choices: string[] = [...optionsSet];

    // Fisher-Yates Shuffle
    for (let i = choices.length - 1; i >= 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = choices[j];
      choices[j] = choices[i];
      choices[i] = temp;
    }

    return choices;
  }, [countryCodeIndex]);

  // UseEffect Setup ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  useEffect(() => {
    getFlagPaths();
    setCountryCodeIndex(0);
  }, [selectedCountryCodes]);

  useEffect(() => {
    if (!flagPaths) return;

    const curPath = flagPaths.get(selectedCountryCodes[countryCodeIndex]);

    if (curPath) setCurrentFlagPath(curPath);
  }, [flagPaths]);

  // Track if we are inbetween rounds ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  useEffect(() => {
    inbetweenRoundsRef.current = inbetweenRounds;
  }, [inbetweenRounds]);

  // Handle Option Click ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const handleOptionClick = (option: string) => {
    document.addEventListener("mousedown", advancePrompt);

    setInbetweenRounds(true);

    if (selectedCountryCodes[countryCodeIndex].localeCompare(option) === 0) {
      //Correct option
      // console.log("Correct option selected.");
      setOnSelectResponse("Nice Job!");
    } else {
      //Incorrect option
      // console.log("Incorrect option selected.");
      setOnSelectResponse("Whoops!");
    }

    setShowAnswer(true);
  };

  // Advance to next prompt ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const advancePrompt = () => {
    setInbetweenRounds(false);
    document.removeEventListener("mousedown", advancePrompt);

    setShowAnswer(false);
    setOnSelectResponse("");

    // This was the last country in our game
    if (countryCodeIndex === selectedCountryCodes.length - 1) {
      // setCurrentFlagPath(flagPaths?.get(selectedCountryCodes[0]));
      // setCountryCodeIndex(0); // Temp wrap around
      handleGameEnd();
    } else {
      setCurrentFlagPath(
        flagPaths?.get(selectedCountryCodes[countryCodeIndex + 1])
      );
      setCountryCodeIndex((prev) => prev + 1); // Advance the game
    }
  };

  // Change current displayed flag ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const handleMouseOver = (option: string) => {
    if (!inbetweenRoundsRef.current) {
      return;
    }

    if (!flagPaths) return;

    const hoveredFlagPath = flagPaths.get(option);

    if (hoveredFlagPath) setCurrentFlagPath(hoveredFlagPath);
  };

  // Reset current displayed flag ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const handleMouseLeave = () => {
    if (!inbetweenRoundsRef.current) return;
    setCurrentFlagPath(flagPaths?.get(selectedCountryCodes[countryCodeIndex]));
  };

  // While waiting for flag paths to be resolved ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  if (!flagPaths || !selectedCountryCodes) {
    return <span> Loading... </span>;
  }

  // TSX Return ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  return (
    <>
      <div className="quiz-container">
        <div className="prompt-container">
          {onSelectResponse && (
            <span className="answer">{onSelectResponse}</span>
          )}
          <img height="600px" width="600px" src={currentFlagPath} />
          {showAnswer && (
            <span className="answer">
              {countryMap[selectedCountryCodes[countryCodeIndex]]}
            </span>
          )}
        </div>
        <div className="options-container">
          <ul>
            {options.map((option) => (
              <li
                className="option"
                onClick={() => handleOptionClick(option)}
                onMouseOver={() => handleMouseOver(option)}
                onMouseLeave={() => handleMouseLeave()}
                key={option}
              >
                {countryMap[option]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default QuizUI;

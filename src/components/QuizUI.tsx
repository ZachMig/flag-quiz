import { useEffect, useState } from "react";
import countries from "../assets/countries.json";

interface QuizUIProps {
  selectedCountryCodes: string[];
}

const QuizUI = ({ selectedCountryCodes }: QuizUIProps) => {
  selectedCountryCodes.forEach((code) => console.log(code));

  const countryMap: Record<string, string> = countries;

  const [flagPaths, setFlagPaths] = useState<null | string[]>(null);

  const numChoices = 6;

  const modules: any = import.meta.glob("../assets/flags/*.svg", {
    eager: true,
  });

  console.log(countries);

  const getFlagPaths = async (selectedCountryCodes: string[]) => {
    const flagPaths: string[] = [];

    console.log("Available flags:", Object.keys(modules));

    for (const countryCode of selectedCountryCodes) {
      const filePath = `../assets/flags/${countryCode}.svg`;
      console.log("Trying to import " + filePath);

      if (modules[filePath]) {
        const module: any = await modules[filePath];

        flagPaths.push(module.default);
      } else {
        console.log("Returning null.");
        return null;
      }
    }

    console.log(flagPaths.length);

    setFlagPaths(flagPaths);
  };

  const options = () => {
    const choices: string[] = [];

    const indexes = new Set<number>();
    while (indexes.size < numChoices - 1) {
      indexes.add(Math.floor(Math.random() * Object.keys(countries).length));
    }

    for (const n of indexes) {
      console.log(n);
    }

    let count = 0;
    for (const countryName of Object.values(countries)) {
      if (indexes.has(count)) {
        choices.push(countryName);
      }
      count++;
    }

    // Force-add the selected country
    choices.push(countryMap[selectedCountryCodes[0].toUpperCase()]);

    // Fisher-Yates Shuffle
    for (let i = choices.length - 1; i >= 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = choices[j];
      choices[j] = choices[i];
      choices[i] = temp;
    }

    return choices;
  };

  useEffect(() => {
    getFlagPaths(selectedCountryCodes);
  }, [selectedCountryCodes]);

  // While waiting for flag paths to be resolved
  if (!flagPaths) {
    return <span> Loading... </span>;
  }

  return (
    <>
      <div className="quiz-container">
        <div className="prompt-container">
          <img height="600px" width="600px" src={flagPaths[0]}></img>
        </div>
        <div className="options-container">
          <ul>
            {options().map((option) => (
              <li>{option}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default QuizUI;

import "./App.css";
import QuizUI from "./components/QuizUI";

// https://vite.dev/guide/features#glob-import for reference of importing flag SVG files
function App() {
  const codes: string[] = ["cu", "ch", "ua", "um", "ru", "de", "jp"];
  return (
    <>
      <div className="app-container">
        <QuizUI selectedCountryCodes={codes} />
      </div>
    </>
  );
}

export default App;

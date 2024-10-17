import "./App.css";
import QuizUI from "./components/QuizUI";

// https://vite.dev/guide/features#glob-import for reference of importing flag SVG files
function App() {
  const codes: string[] = ["cu"];
  return (
    <>
      <QuizUI selectedCountryCodes={codes} />
    </>
  );
}

export default App;

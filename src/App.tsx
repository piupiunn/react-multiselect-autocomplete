import React from "react";
import MultiSelectAutocomplete from "./components/MultiSelectAutocomplete";

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Look Morty, I turned myself into a Task. I'm Task Riiickk!!!</h1>
      <img className="rick" src="/images/rick-task.png" alt="rick-sanchez" />
      <MultiSelectAutocomplete />
    </div>
  );
};

export default App;

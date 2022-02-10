
import './App.css';
import Ensemble from './components/Ensemble'
import Visual from './components/Visual'
function App() {
  console.log("app rendered")
  return (
    <div className="App">
      <Ensemble />
      <Visual />
    </div>
  );
}

export default App;

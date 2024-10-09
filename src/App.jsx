import { useEffect } from "react";

function App() {
  // fetch data when the app first renders using useEffect
  useEffect(() => {
    // load the json from the dog api url using the async await syntax
    async function go() {
        const picsPromise = await fetch("https://dog.ceo/api/breeds/image/random/50");
        const pics = await picsPromise.json();
        console.log(pics.message);
    }
    // right after the definition call it imediately
    go()
  }, [])

  return (
    <div>
      <h1 className="text-green-500 font-bold text-3xl">Hello from React</h1>
    </div>
  )
}

export default App

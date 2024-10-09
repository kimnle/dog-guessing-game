import { useEffect } from "react";

function App() {
  // fetch data when the app first renders using useEffect
  useEffect(() => {
    // cancel or abort fetch request
    const reqController = new AbortController();

    // load the json from the dog api url using the async await syntax
    async function go() {
      try {
        // use reqController when performing the fetch to identify this request and cancel it in clean up function
        const picsPromise = await fetch("https://dog.ceo/api/breeds/image/random/50", {signal: reqController.signal});
        const pics = await picsPromise.json();
        console.log(pics.message);
      } catch {
        console.log("Our request was cancelled");
      }
    }
    // right after the definition call it imediately
    go();

    // if someone visited this component the fetch is
    // going to begin but if someone navigates away from
    // this component we would want to immediately cancel
    // or abort the network request and any state changes
    // that we were making that depended on the network request

    // react is going to call this clean up function when this
    // component unmounts to cancel network request which is going
    // to cause an error so anything that was going to await below
    // picsPromise line won't run and then catch will be executed
    return () => {
      reqController.abort();
    }
  }, []);

  return (
    <div>
      <h1 className="text-green-500 font-bold text-3xl">Hello from React</h1>
    </div>
  )
}

export default App

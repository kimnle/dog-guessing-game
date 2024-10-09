import { useEffect } from "react";

// function to filter out duplicates and shave it off so that the array ends in a multiple of four
function onlyUniqueBreeds(pics) {
  const uniqueBreeds = [];
  // loop through the array of urls and build a list of all unique breeds
  const uniquePics = pics.filter(pic => {
    // figure out what the breed of the current dog is
    const breed = pic.split("/")[4];
    // if return true the current item that's been looped to will be included in the new array that's building
    // if return false it will be skipped

    // if the breed doesn't already exist
    // in the list of breeds that we're keeping
    // track of and if it doesn't include a space
    // in the file name (don't want to bother converting
    // the space into %20) then include it in the new array
    // that's building
    if (!uniqueBreeds.includes(breed) && !pic.includes(" ")) {
      // add it to collection that's been kept track of
      uniqueBreeds.push(breed);
      return true;
    }
  });
  // return a multiple of four to guarantee there won't be any duplicate breeds when the next 50s are combined
  return uniquePics.slice(0, Math.floor(uniquePics.length / 4) * 4);
}

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
        const uniquePics = onlyUniqueBreeds(pics.message);
        console.log(uniquePics);
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

import { useEffect } from "react";
import { useImmerReducer } from "use-immer";

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

// usually in react don't directly mutate the state and if working with an object with lots of different sub properties
// it can get a little bit awkward because have to get creative of copying or sort of rebuilding own new version of state

// immer gives us draft - free to directly change and mutate draft
// in reducer spell out different action types and application will dispatch them
function ourReducer(draft, action) {
  switch(action.type) {
    case "startPlaying":
      // each time get 30 seconds to play the game
      draft.timeRemaining = 30;
      // reset the game because playing the game another time
      draft.points = 0;
      draft.strikes = 0;
      // playing the game/game has begun
      draft.playing = true;
      draft.currentQuestion = generateQuestion();
      return
    case "addToCollection":
      // directly add on to the existing array
      draft.bigCollection.push(action.value);
      // normally in a reducer would have to return the new value but with immer can return nothing and draft will be used automatically
      return;
  }

  // goal of this function is to return an object
  function generateQuestion() {
    // every time a question is generated remove
    // the first four items in the array because
    // the next time a question is generated want
    // the new first four in the old array but the
    // very first time start playing in the app is
    // clicked don't need to remove the orginial four

    // if this evaluates to true that means a question
    // has already been generated before which means the
    // game has already been started to play which means
    // remove the first four items
    if (draft.currentQuestion) {
      draft.bigCollection = draft.bigCollection.slice(4, draft.bigCollection.length);
    }

    // generate random number from 0 to 3
    const tempRandom = Math.floor(Math.random() * 4);
    // create the array that user is choosing from
    const justFour = draft.bigCollection.slice(0, 4);
    // properties a question should have
    // breed should be the text value that has been identified as the correct answer
    // answer would be the correct image from the random number where the user chooses between an array of four image (0 through 3)
    return {breed: justFour[tempRandom].split("/")[4], photos: justFour, answer: tempRandom};
  }
}

// spell out everything the game is going to need
const initialState = {
  points: 0,
  strikes: 0,
  timeRemaining: 0,
  highScore: 0,
  // where all of the images for different dogs are stored
  bigCollection: [],
  currentQuestion: null,
  playing: false,
  // increment this to fetch another 50 dog images
  fetchCount: 0
}

function App() {
  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

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
        // calling dispatch that exists from const [state, dispatch] line to trigger or use the reducer

        // throughout the entire application don't have to worry about the details of how state is getting
        // changed can just dispatch an action and all of the logic can live inside ourReducer 
        dispatch({type: "addToCollection", value: uniquePics});
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
      {/* position the button */}
      <p className="text-center fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center">
        {/* make button look nice */}
        {/* don't want to have to worry about how state should change in jsx and event handler */}
        {/* want all of that to live in reducer by spelling out an action with this matching name */}
        <button onClick={() => dispatch({type: "startPlaying"})} className="text-white bg-gradient-to-b from-indigo-500 to-indigo-600 px-4 py-3 rounded text-2xl font-bold">Play</button>
      </p>
    </div>
  )
}

export default App

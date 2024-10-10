import { useEffect } from "react";
import { useImmerReducer } from "use-immer";

// function to filter out duplicates and shave it off so that the array ends in a multiple of four
function onlyUniqueBreeds(pics) {
  const uniqueBreeds = [];
  // loop through the array of urls and build a list of all unique breeds
  const uniquePics = pics.filter(pic => {
    // figure out what the breed of the current dog is
    const breed = pic.split("/")[4];
    // if we return true the current item that's been looped to will be included in the new array that we're building
    // if we return false it will be skipped

    // if the breed doesn't already exist in
    // our list of breeds that we're keeping
    // track of and if it doesn't include a
    // space in the file name (don't want to
    // have to bother converting the space into
    // %20) then we want to include it in the new
    // array that we're building
    if (!uniqueBreeds.includes(breed) && !pic.includes(" ")) {
      // add it to our collection that we're keeping track of
      uniqueBreeds.push(breed);
      return true;
    }
  });
  // return a multiple of four so that way we can guarantee there won't be any duplicate breeds when we combine the next 50 etc
  return uniquePics.slice(0, Math.floor(uniquePics.length / 4) * 4);
}

// usually in react we don't directly mutate the state and if we're working with an object with lots of different sub properties
// it can get a little bit awkward because we have to get creative to copy or rebuilding our own new version of state

// immer gives us draft and we are free to directly change and mutate draft
// in our reducer we spell out different action types and our application will dispatch them
function ourReducer(draft, action) {
  switch(action.type) {
    case "startPlaying":
      // each time we play the game we get 30 seconds
      draft.timeRemaining = 30;
      // reset the game when we're playing the game another time
      draft.points = 0;
      draft.strikes = 0;
      // playing the game now/game has begun
      draft.playing = true;
      // create this function living inside ourReducer 
      draft.currentQuestion = generateQuestion();
      return
    case "addToCollection":
      // take the entire array and combine that onto our array
      draft.bigCollection = draft.bigCollection.concat(action.value);
      // normally in a reducer we would have to return the new
      // value but with immer we can return nothing and draft
      // will be used automatically
      return;
  }

  // goal of this function is to return an object
  function generateQuestion() {
    // every time we generate a question we would
    // want to remove the first four items in the
    // array because the next time we generate a
    // question we want the new first four in the
    // old array but the very first time we click
    // start playing in the app we don't need to
    // remove the orginial four

    // if this evaluates to true
    // that means a question has
    // already been generated before
    // which means the game has already
    // started to play which means we would
    // want to remove the first four items
    if (draft.currentQuestion) {
      draft.bigCollection = draft.bigCollection.slice(4, draft.bigCollection.length);
    }

    // generate a random number from 0 to 3
    const tempRandom = Math.floor(Math.random() * 4);
    // create the array with four items in it that user is choosing from
    const justFour = draft.bigCollection.slice(0, 4);
    // properties the question should have
    // breed should be the text value that we've identified as the correct answer
    // answer would be the correct image from the random number where the user chooses between an array of four image so 0 through 3
    return {breed: justFour[tempRandom].split("/")[4], photos: justFour, answer: tempRandom};
  }
}

// spell out everything we know our game is going to need before we first start the game
const initialState = {
  points: 0,
  strikes: 0,
  timeRemaining: 0,
  highScore: 0,
  // where we store all of the images for the different dogs
  bigCollection: [],
  currentQuestion: null,
  playing: false,
  // increment this any time we want to fetch another 50 dog images
  fetchCount: 0
}

function App() {
  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  // fetch data when our app first renders using useEffect
  useEffect(() => {
    // cancel or abort fetch request
    const reqController = new AbortController();

    // load the json from the dog api url using the async await syntax
    async function go() {
      try {
        // use reqController when performing the fetch to identify this request and cancel it in our clean up function
        const picsPromise = await fetch("https://dog.ceo/api/breeds/image/random/50", {signal: reqController.signal});
        const pics = await picsPromise.json();
        const uniquePics = onlyUniqueBreeds(pics.message);
        // calling dispatch that exists from [state, dispatch] line to trigger or use the reducer

        // throughout our entire application we don't have to worry about the details of how state
        // is getting changed we can just dispatch an action and all of the logic can live inside
        // ourReducer 
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

    // react is going to call this clean up function when our
    // component unmounts to cancel the network request which
    // is going to cause an error so then anything that was going
    // to await below the picsPromise line won't run and then our
    // catch will be executed
    return () => {
      reqController.abort();
    }
  }, []);

  return (
    <div>
      {state.currentQuestion && (
        <>
          {/* show the current question */}
          <h1 className="text-center font-bold pt-3 pb-10 break-all text-4xl md:text-7xl">{state.currentQuestion.breed}</h1>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 px-5">
            {/* and the four images of the dogs which will only display once we're playing the game */}
            {state.currentQuestion.photos.map((photo, index) => {
              // for the background image don't use tailwind and add that property directly ourselves
              return <div key={index} className="rounded-lg h-40 lg:h-80 bg-cover bg-center" style={{backgroundImage: `url(${photo})`}}></div>
            })}
          </div>
        </>
      )}
      {/* the start playing button should only display if we're not already playing and wait to show the
      play button until we've successfully fetched data from the api so when we first load the screen it
      can be empty because we don't want to click on the play button if we don't have any data ready yet
      and when the first time the app is loading up currentQuestion is set to null so we want to show the
      initial start playing button */}
      {state.playing == false && Boolean(state.bigCollection.length) && !state.currentQuestion && (
        <>
          {/* position the button */}
          <p className="text-center fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center">
          {/* make button look nice */}
          {/* don't want to have to worry about how state should change in our jsx and event handler */}
          {/* we want all of that to live in reducer by spelling out an action with this matching name */}
            <button onClick={() => dispatch({type: "startPlaying"})} className="text-white bg-gradient-to-b from-indigo-500 to-indigo-600 px-4 py-3 rounded text-2xl font-bold">
              Play
            </button>
          </p>
        </>
      )}
    </div>
  )
}

export default App

import { initStore } from 'react-waterfall';

function padInteger(baseInt, places){
  let retVal = baseInt.toString();
  while( retVal.length < places ){
    retVal = '0' + retVal;
  }
  return retVal;
}

const getImagesFromPattern = (pattern) =>{
  const images = [];
  const startIdx = parseInt(pattern.start);
  const endIdx = parseInt(pattern.end);
  const numImages = endIdx - startIdx + 1;

  let padPlaces = 0;
  if(pattern.start.length === pattern.end.length){
    //- using padded numbers
    padPlaces = pattern.start.length;
  }else{
    console.log('pattern.start and pattern.end are not padded the same')
    console.log(`assuming images between ${pattern.start} and ${startIdx + numImages - 1}`);
  }

  for(let i = startIdx; i < numImages + startIdx; i++){
    images.push(pattern.pattern.replace('*', padInteger(i, padPlaces)));
  }

  return images;
}

const store = {
  initialState: {
    loaded:false,
    defaultSpinId: null,
    spinDefinitions:{},
    spinLabels:[],
    framerate:30,
    settings: false,
    debug: true,
    useAcceleration: false,
    curSpin:{
      id: null,
      images: [],
      physics: null,
      title: null
    }
  },
  actions: {
    toggleLoaded: ({ loaded }) => ({ loaded: !loaded }),
    setFramerate: ({ framerate }, newVal) => ({ framerate: newVal }),
    setUseAcceleration: ({ useAcceleration }, newVal) => ({ useAcceleration: newVal }),
    setDebug: ({ debug }, newVal) => ({ debug: newVal }),
    setSettings: ({ settings }, newVal) => ({ settings: newVal }),
    setRotaterData: ({ spinDefinitions, defaultSpinId, spinLabels }, newData) => {
      const newSpinLabels = [];
      for(let spinId in newData.spins){
        newData.spins[spinId].id = spinId;
        newSpinLabels.push({
          id: spinId,
          title: newData.spins[spinId].title
        });
        //- get default physics values, with any overrides.
        newData.spins[spinId].physics = Object.assign({}, newData.defaultPhysics, newData.spins[spinId].physics);
      };

      return{
        spinDefinitions: newData.spins,
        defaultSpinId: newData.defaultSpinId,
        spinLabels: newSpinLabels,
        loaded: true
      }
    },
    setCurrentSpin: ({ spinDefinitions, curSpin }, spinId) => {
      const foundSpin = spinDefinitions[spinId];

      let images;
      if(foundSpin.imagePattern){
        images = getImagesFromPattern(foundSpin.imagePattern)
      }

      const newCurSpin = {
        id: foundSpin.id,
        direction: foundSpin.direction || 1,
        images: images,
        physics: foundSpin.physics,
        title: foundSpin.title
      }

      return {
        curSpin: newCurSpin
      }
    }
  }
};
 
export const { Provider, connect } = initStore(store);
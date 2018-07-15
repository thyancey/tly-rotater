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
    curSpin:{
      id: null,
      images: [],
      title: null
    }
  },
  actions: {
    toggleLoaded: ({ loaded }) => ({ loaded: !loaded }),
    setRotaterData: ({ spinDefinitions, defaultSpinId }, newData) => {
      return{
        spinDefinitions: newData.spins,
        defaultSpinId: newData.defaultSpinId,
        loaded:true
      }
    },
    setCurrentSpin: ({ spinDefinitions, curSpin }, spinId) => {
      const foundSpin = spinDefinitions[spinId];

      let images;
      if(foundSpin.imagePattern){
        images = getImagesFromPattern(foundSpin.imagePattern)
      }
      images = images || foundSpin.images;
      
      const newCurSpin = {
        id: foundSpin.id,
        images: images,
        title: foundSpin.title
      }

      return {
        curSpin: newCurSpin
      }
    }
  }
};
 
export const { Provider, connect } = initStore(store);
import React, { Component } from 'react';

import { connect } from 'src/store';

import Rotater from 'src/components/rotater';

require('./style.less');

class Main extends Component {

  loadStoreData(){
    // const url = process.env.PUBLIC_URL + '/data.json';
    const url = '/data/rotater.json';
    console.log(`reading app data from "${url}"`);

    fetch(url).then(response => {
                      return response.json();
                    }, 
                    err => console.error("Error fretching url", err)) //- bad url responds with 200/ok? so this doesnt get thrown
              .then(json => {
                      console.log(json)
                      this.props.actions.setRotaterData(json);
                      return true;
                    }, 
                    err => console.error("Error parsing store JSON (or the url was bad)", err));
  }

  componentDidMount(){
    this.loadStoreData();
  }

  componentDidUpdate(prevProps){
    if(this.props.loaded && !prevProps.loaded){
      this.props.actions.setCurrentSpin(this.props.defaultSpinId)
    }
  }

  render() {
    return(
      <div className="main">
        <header>
          <h1>{'Rotater'}</h1>
        </header>
        <section className="body">  
          <Rotater curSpin={this.props.curSpin}/>
        </section>
      </div>
    );

  }
}

export default connect(state => ({ 
  loaded: state.loaded,
  defaultSpinId: state.defaultSpinId,
  curSpin: state.curSpin
}))(Main);

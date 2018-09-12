import React, { Component } from 'react';
import { connect } from 'src/store';
import Icon_DropDown from '../../images/drop-down.svg';
import Icon_RotateLeft from '../../images/rotate-left.svg';
import Icon_RotateRight from '../../images/rotate-right.svg';

import Header from 'src/components/header';
import Button from 'src/components/shared/button';
import Rotater from 'src/components/rotater';

require('./style.less');

class RotaterContainer extends Component {
  constructor(){
    super();
    
    this.state = {
      holdingButton:null
    }
  }

  loadStoreData(){
    const url = './data/rotater.json';
    console.log(`reading app data from "${url}"`);

    fetch(url).then(response => {
                      return response.json();
                    }, 
                    err => console.error("Error fretching url", err)) //- bad url responds with 200/ok? so this doesnt get thrown
              .then(json => {
                      // console.log('data read.');
                      this.props.actions.setRotaterData(json);
                      return true;
                    }, 
                    err => console.error("Error parsing store JSON (or the url was bad)", err));
  }


  componentDidMount(){
    this.loadStoreData();
  }

  componentDidUpdate(prevProps){
    if(this.props.loaded && (!prevProps.loaded || this.props.curSpin.id === null)){
      this.props.actions.setCurrentSpin(this.props.defaultSpinId);
    }
  }


  onRotationButtonDown(mouseOrTouchEvent, direction){
    this.setState({ holdingButton: direction });
  }

  onRotationButtonUp(mouseOrTouchEvent, direction){
    try{
      mouseOrTouchEvent.preventDefault();

      if(this.state.holdingButton){
        this.stopHoldingButtons();
      }
    }catch(e){
      console.error('problem with onRotationButtonUp:', e);
    }
  }

  stopHoldingButtons(){
    this.setState({ holdingButton: null });
  }


  changeSpin(spinId){
    this.props.actions.setCurrentSpin(spinId)
  }

  closeSettings(e){
    this.props.actions.setSettings(false);
  }

  renderManualButton(buttonDirection, icon){
    return(
      <div  className={`button ${buttonDirection}`} 
            onMouseDown={e => this.onRotationButtonDown(e, buttonDirection)}
            onMouseUp={e => this.onRotationButtonUp(e, buttonDirection)}
            onMouseLeave={e => this.onRotationButtonUp(e, buttonDirection)} 
            onTouchStart={e => this.onRotationButtonDown(e, buttonDirection)}
            onTouchEnd={e => this.onRotationButtonUp(e, buttonDirection)} >
        {icon}
      </div>
   );
  }

  renderSpinSelection(){
    if(this.props.curSpin.id){
      return(
        <div className="select-spin" >
          <Icon_DropDown />
          <select value={this.props.curSpin.id} onChange={e => this.changeSpin(e.target.value)}>
            {this.props.spinLabels.map((sLabel, idx) => (<option key={idx} value={sLabel.id}>{sLabel.title}</option>))}
          </select>
        </div>
      );
    }else{
      return null;
    }
  }

  render() {
    return (
      <div className="main">
        <Header /> 
        <section className="body" onMouseEnter={e => this.closeSettings(e)} onTouchStart={e => this.closeSettings(e)}>  
          <div className="rotater-stage">
            <section className="section-spin">
              <div className="button-container">
                <Button direction="left" 
                        onPress={(e, direction) => this.onRotationButtonDown(e, direction)} 
                        onRelease={(e, direction) => this.onRotationButtonUp(e, direction)} >
                  <Icon_RotateRight/>
                </Button>
              </div>
              <Rotater curSpin={this.props.curSpin}
                       framerate={this.props.framerate} 
                       manualDirection={this.state.holdingButton}
                       debug={this.props.debug}
                       useAcceleration={this.props.useAcceleration} />
              <div className="button-container">
                <Button direction="right" 
                        onPress={(e, direction) => this.onRotationButtonDown(e, direction)} 
                        onRelease={(e, direction) => this.onRotationButtonUp(e, direction)} >
                  <Icon_RotateLeft/>
                </Button>
              </div>
            </section>
            {this.renderSpinSelection()}
          </div>
        </section>
        <div id="holla">
          <a href="http://www.thomasyancey.com" target="_blank">{'...see some of my other stuff'}</a>
        </div>
      </div>
    );
  }
}


export default connect(state => ({ 
  loaded: state.loaded,
  defaultSpinId: state.defaultSpinId,
  spinLabels: state.spinLabels,
  debug: state.debug,
  settings: state.settings,
  framerate: state.framerate,
  useAcceleration: state.useAcceleration,
  curSpin: state.curSpin
}))(RotaterContainer);

import React, { Component } from 'react';
import { connect } from 'src/store';
import Icon_Settings from '../../images/settings.svg';
import Icon_DropDown from '../../images/drop-down.svg';
import Icon_RotateLeft from '../../images/rotate-left.svg';
import Icon_RotateRight from '../../images/rotate-right.svg';

import Rotater from 'src/components/rotater';

require('./style.less');


const MAX_FRAMERATE = 10;
const MIN_FRAMERATE = 1000;

class RotaterContainer extends Component {
  constructor(){
    super();
    
    this.state = {
      holdingButton:null,
      framerate:0,
      framerateSetting:.75,
      debug: true,
      acceleration: false,
      settings: false
    }
  }


  loadStoreData(){
    // const url = process.env.PUBLIC_URL + '/data.json';
    const url = './data/rotater.json';
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
      this.props.actions.setCurrentSpin(this.props.defaultSpinId);
      this.setFramerate(this.state.framerateSetting);
    }
  }


  setFramerate(percValue){
    const framerate = this.getLogValues(percValue, MIN_FRAMERATE, MAX_FRAMERATE, true);
    this.setState({
      framerateSetting: percValue,
      framerate: framerate
    });
  }

  getLogValues(percent, min, max, shouldRound){
    const minValue = Math.log(min);
    const maxValue = Math.log(max);
    const scale = Math.log(max) - Math.log(min);

    if(shouldRound){
      return parseInt(Math.exp(minValue + scale * percent));
    }else{
      return Math.exp(minValue + scale * percent);
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

  onToggle(e, key, force){
    e.preventDefault();

    if(force !== undefined){
      this.setState({ [key]: force });
    }else{
      this.setState({ [key]: !this.state[key] });
    }
  }

  changeSpin(spinId){
    this.props.actions.setCurrentSpin(spinId)
  }

  onSettingsLeave(){
    console.log('settings leave');
    this.setState({settings: false});
  }

  renderSettings(){
    const framerate = `${parseInt(1000 / this.state.framerate)} fps`;

    return (
      <section className="settings">
        <div className="settings-button" onMouseEnter={e => this.onToggle(e, 'settings', true)} >
          <h4>{'Settings'}</h4>
          <div>
            <Icon_Settings />
          </div>
        </div>
        <div className={`settings-body ${this.state.settings ? '' : 'hidden'}`} >
          <div className="settings-description">
            <p>{'Rotater is a React component that takes a list of images and simulates a rotating object. It works well with files exported from 3D programs, but really shines with handmade image sequences!'}</p>
          </div>
          <div className="settings-menu">
            <div className="setting setting-slider">
              <p>{`framerate: ${framerate}`}</p>
              <input type='range' value={this.state.framerateSetting} min={0.0} max={1.0} step={0.01} onChange={e => this.setFramerate(e.target.value)} />
            </div>
            <div className="setting setting-checkbox" onClick={e => this.onToggle(e, 'debug')}>
              <span>{'debug'}</span>
              <input type="checkbox" label="debug" checked={this.state.debug} onChange={e => {}}/>
            </div>
            <div className="setting setting-checkbox" onClick={e => this.onToggle(e, 'acceleration')}>
              <span>{'acceleration'}</span>
              <input type="checkbox" label="acceleration" checked={this.state.acceleration} onChange={e => {}}/>
            </div>
          </div>
        </div>
      </section>
    )
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

  renderDropdown(){
    if(this.props.curSpin.id){
      return(
        <div className="select-spin" >
          <Icon_DropDown />
          <select value={this.props.curSpin.id} onChange={e => this.changeSpin(e.target.value)}>
            {this.props.spinIds.map((sId, idx) => (<option key={idx} value={sId}>{sId}</option>))}
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
        <header>
          <h1>{'Rotater'}</h1>
          {this.renderSettings()}
        </header>
        <section className="body" onMouseEnter={e => this.onToggle(e, 'settings', false)} >  

          <div className="rotater-stage">

            <section className="middle">
              <div className="button-container">
                {this.renderManualButton('left', (<Icon_RotateRight/>))}
              </div>

              <Rotater curSpin={this.props.curSpin}
                       manualDirection={this.state.holdingButton} 
                       framerate={this.state.framerate} 
                       debug={this.state.debug}
                       useAcceleration={this.state.acceleration} />

              <div className="button-container">
                {this.renderManualButton('right', (<Icon_RotateLeft/>))}
              </div>
            </section>
              {this.renderDropdown()}
          </div>
        <div id="holla">
          <a href="http://www.thomasyancey.com" target="_blank">{'...see some of my other stuff'}</a>
        </div>
        </section>
      </div>
    );
  }
}


export default connect(state => ({ 
  loaded: state.loaded,
  defaultSpinId: state.defaultSpinId,
  spinIds: state.spinIds,
  curSpin: state.curSpin
}))(RotaterContainer);

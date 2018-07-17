import React, { Component } from 'react';
import { connect } from 'src/store';
import Icon_Settings from '../../images/settings.svg';

require('./style.less');

const MAX_FRAMERATE = 10;
const MIN_FRAMERATE = 1000;

class RotaterContainer extends Component {
  constructor(){
    super();
    
    this.state = {
      framerateSetting:.75
    }
  }

  componentDidUpdate(prevProps){
    if(this.props.loaded && !prevProps.loaded){
      this.setFramerate(this.state.framerateSetting);
    }
  }

  setFramerate(percValue){
    const framerate = this.getLogValues(percValue, MIN_FRAMERATE, MAX_FRAMERATE, true);
    this.setState({
      framerateSetting: percValue
    });

    this.props.actions.setFramerate(framerate);
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

  onToggleSettings(e, force){

    if(force !== undefined){
      this.props.actions.setSettings(force);
    }else{
      this.props.actions.setSettings(!this.props.settings);
    }
  }

  onToggleDebug(e, force){
    e.preventDefault();

    if(force !== undefined){
      this.props.actions.setDebug(force);
    }else{
      this.props.actions.setDebug(!this.props.debug);
    }
  }

  onToggleUseAcceleration(e, force){
    e.preventDefault();

    if(force !== undefined){
      this.props.actions.setUseAcceleration(force);
    }else{
      this.props.actions.setUseAcceleration(!this.props.useAcceleration);
    }
  }

  render() {
    const displayFramerate = `${parseInt(1000 / this.props.framerate)} fps`;

    return (
      <header>
        <h1>{'Rotater'}</h1>
        <section className="settings">
          <div className="settings-button" onMouseEnter={e => this.onToggleSettings(e, true)} onTouchStart={e => this.onToggleSettings(e, true)} >
            <h4>{'Settings'}</h4>
            <div>
              <Icon_Settings />
            </div>
          </div>
          <div className={`settings-body ${this.props.settings ? '' : 'hidden'}`} >
            <div className="settings-description">
              <p>{'Rotater is a React component that takes a list of images and simulates a rotating object. It works well with files exported from 3D programs, but really shines with handmade image sequences!'}</p>
            </div>
            <div className="settings-menu">
              <div className="setting setting-slider">
                <p>{`framerate: ${displayFramerate}`}</p>
                <input type='range' value={this.state.framerateSetting} min={0.0} max={1.0} step={0.01} onChange={e => this.setFramerate(e.target.value)} />
              </div>
              <div className="setting setting-checkbox" onClick={e => this.onToggleDebug(e)}>
                <span>{'debug'}</span>
                <input type="checkbox" label="debug" checked={this.props.debug} onChange={e => {}}/>
              </div>
              <div className="setting setting-checkbox" onClick={e => this.onToggleUseAcceleration(e)}>
                <span>{'acceleration'}</span>
                <input type="checkbox" label="acceleration" checked={this.props.useAcceleration} onChange={e => {}}/>
              </div>
            </div>
          </div>
        </section>
      </header>
    );
  }
}


export default connect(state => ({ 
  loaded: state.loaded,
  debug: state.debug,
  settings: state.settings,
  useAcceleration: state.useAcceleration,
  framerate: state.framerate
}))(RotaterContainer);

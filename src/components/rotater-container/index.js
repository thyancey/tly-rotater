import React, { Component } from 'react';

import Rotater from 'src/components/rotater';

require('./style.less');


const MAX_FRAMERATE = 10;
const MIN_FRAMERATE = 1000;

export default class RotaterContainer extends Component {
  constructor(){
    super();
    
    this.state = {
      holdingButton:null,
      framerate:0,
      debug: false,
      framerateSetting:.75
    }
  }

  componentDidMount(){
    this.setFramerate(this.state.framerateSetting);
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

  onToggleDebug(){
    this.setState({ debug: !this.state.debug });
  }

  render() {
    const framerate = `${parseInt(1000 / this.state.framerate)} fps`;

    return (
      <div className="rotater-container">
        <div className="rotater-stage">
          <section className="top">
            <div className="setting settings-debug" onClick={e => this.onToggleDebug()}>
              <span>{'debug'}</span>
              <input type="checkbox" label="debug" checked={this.state.debug} />
            </div>
            <div className="setting settings-framerate">
              <p>{`framerate: ${framerate}`}</p>
              <input type='range' value={this.state.framerateSetting} min={0.0} max={1.0} step={0.01} onChange={e => this.setFramerate(e.target.value)} />
            </div>
          </section>

          <Rotater curSpin={this.props.curSpin}
                   manualDirection={this.state.holdingButton} 
                   framerate={this.state.framerate} 
                   debug={this.state.debug} />

          <section className="bottom">
            <div  className="button left" 
                  onMouseDown={e => this.onRotationButtonDown(e, 'left')}
                  onMouseUp={e => this.onRotationButtonUp(e, 'left')}
                  onMouseLeave={e => this.onRotationButtonUp(e, 'left')} 
                  onTouchStart={e => this.onRotationButtonDown(e, 'left')}
                  onTouchEnd={e => this.onRotationButtonUp(e, 'left')} >
              <p>{'<'}</p>
            </div>
            <div className="rotater-pedestal">
            </div>
            <div  className="button right" 
                  onMouseDown={e => this.onRotationButtonDown(e, 'right')}
                  onMouseUp={e => this.onRotationButtonUp(e, 'right')}
                  onMouseLeave={e => this.onRotationButtonUp(e, 'right')} 
                  onTouchStart={e => this.onRotationButtonDown(e, 'right')}
                  onTouchEnd={e => this.onRotationButtonUp(e, 'right')} >
              <p>{'>'}</p>
            </div>
          </section>
        </div>
      </div>
    );
  }
}

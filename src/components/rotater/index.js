import React, { Component } from 'react';

require('./style.less');

const MAX_X = 300;

const MAX_FRAMERATE = 10;
const MIN_FRAMERATE = 1000;

export default class Rotater extends Component {
  constructor(){
    super();
    
    this.state = {
      curIdx: 0,
      curImage: 'images/htcone/closed_000.png',
      holdingButton:null,
      startX: 0,
      dragXPercent: 0,
      lastTime:0,
      dragging: false,
      isSpinning: false,
      angle:0,
      APMs:0,
      framerate:0,
      framerateSetting:.75
    }
  }

  onRotaterMouseDown(mouseEvent){
    this.setState({ 
      dragging: true,
      startX: mouseEvent.clientX,
      isSpinning:true
    });
  }
  onRotaterMouseUp(mouseEvent){
    this.stopDragging(mouseEvent.clientX);

  }
  onRotaterMouseLeave(mouseEvent){
    this.stopDragging(mouseEvent.clientX);
  }

  onRotaterMouseMove(mouseEvent){
    if(this.state.dragging){
      this.onMouseDrag(mouseEvent.clientX, this.state.startX);
    }
  }

  stopDragging(mouseX){
    this.setState({ 
      dragging: false,
      startX: 0,
      dragXPercent: 0
    });
  }

  onMouseDrag(curX, startX){
    let xDir = 1;
    let dx = curX - startX;

    //at some point, you've dragged far enough.
    if(Math.abs(dx) > MAX_X){
      if(dx < 0){
        xDir = -1;
      }
      dx = MAX_X * xDir;
    }

    const dragXPercent = dx / MAX_X;

    // console.log('dragXPercent: ', dragXPercent)
    this.setState({ dragXPercent: dragXPercent });
  }



  advanceSpinIndex(newIdx){
    const numImages = this.props.curSpin.images.length;
    if(newIdx >= numImages){
      this.setState({ curIdx: 0 });
    }else if(newIdx < 0){
      this.setState({ curIdx: numImages - 1 });
    }else{
      this.setState({ curIdx: newIdx })
    }
  }

  onClickSpinForward(mouseEvent){
    console.log('->');
    this.advanceSpinIndex(this.state.curIdx + 1);
  }

  onClickSpinBackward(mouseEvent){
    console.log('<-');
    this.advanceSpinIndex(this.state.curIdx - 1);
  }


  renderImageContainer(curSpin, curSpinIdx){
    if(curSpin){
      return (
        <div className="rotater-image-container" 
             onMouseDown={e => this.onRotaterMouseDown(e)}
             onMouseMove={e => this.onRotaterMouseMove(e)}
             onMouseUp={e => this.onRotaterMouseUp(e)}
             onMouseLeave={e => this.onRotaterMouseUp(e)} >
          {curSpin.images.map((si, idx) => (
            <img draggable={false} key={idx} src={si} style={{ 'display': idx === curSpinIdx ? 'inline' : 'none' }}/>
          ))}
        </div>
      )
    }else{
      return (
        <div className="rotater-image-container">
          <h2>{'loading...'}</h2>
        </div>
      )
    }
  }

  checkPhysics(APMs, lastTime){
    const ph = this.props.curSpin.physics;
    const nowTime = new Date().getTime();
    if(!lastTime){
      this.setState({'lastTime': nowTime});
      return;
    }

    const timeDiff = nowTime - lastTime;

    const speed = .002;
    const accel = 1.02;
    const friction = 1.001;
    // const maxAPMs = .36; //- 1 rotation per second
    const maxAPMs = 3.6; //- 10 rotations per second!
    const minAPMs = .025;

    //- calc amount of change per millisecond cycle
    const speedo = (this.state.dragXPercent * accel) * speed;

    //- now apply for all milliseconds that have passed.
    if(this.state.dragging){
      for(let i = 0; i < timeDiff; i++){
        APMs += speedo;

        // APMs /= friction;
      }
    }else{
      for(let i = 0; i < timeDiff; i++){
        APMs /= friction;
      }
    }

    let direction = APMs > 0 ? 1 : -1;
    
    //- if you're moving slow enough, just go ahead and stop instead of wasting cycles and looking bad
    if(Math.abs(APMs) < minAPMs && !this.state.dragging){
      this.haltSpinning(nowTime);
    }else{
      //- plateu speed if moving too fast
      if(maxAPMs && Math.abs(APMs) > maxAPMs){
        // console.log('maxed out');
        APMs = maxAPMs * direction;
      }

      //- apply current speed and passed time to actual rotation
      this.applySpin(APMs, timeDiff, nowTime);
    }
  }

  //- now apply speed to the spin
  applySpin(APMs, timeDiff, lastTime){
    const angleChange = APMs * timeDiff;

    const newAngle = this.state.angle + angleChange;
    const idx = this.getFrameAtAngle(newAngle);

    this.setState({
      lastTime: lastTime,
      angle: newAngle,
      APMs: APMs,
      isSpinning:true,
      curIdx: idx
    });
  }

  haltSpinning(lastTime){
    this.setState({
      lastTime: lastTime,
      APMs:0,
      isSpinning:false
    });
  }

  //- get an angle, return which idx of image to display.
  //- angle can be negative or well over 360 degrees.
  getFrameAtAngle(angle){
    let mod;

    if(angle < 0){
      //- js does negative modulos weird
      mod = ((angle % 360) + 360) % 360;
    }else{
      mod = angle % 360;
    }

    return Math.floor((mod / 360) * this.props.curSpin.images.length);
  }

  manualRotation(angleChange){
    const newAngle = this.state.angle + angleChange;
    const idx = this.getFrameAtAngle(newAngle);

    this.setState({
      angle: newAngle,
      curIdx: idx
    });
  }

  onSpinInterval(){
    if(this.state.isSpinning){
      this.checkPhysics(this.state.APMs, this.state.lastTime);
    }

    if(this.state.holdingButton === 'left'){
      this.manualRotation(-1);

    }else if(this.state.holdingButton === 'right'){
      this.manualRotation(1);
    }
  }

  startSpinInterval(framerate){
    this.killSpinInterval();
    this.spinInterval = global.setInterval(() => {
      this.onSpinInterval();
    }, framerate);
  }

  killSpinInterval(){
    if(this.spinInterval){
      global.clearInterval(this.spinInterval);
      this.spinInterval = null;
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(prevState.framerate !== this.state.framerate){
      this.startSpinInterval(this.state.framerate);
    }

  }

  componentDidMount(){
    this.setFramerate(this.state.framerateSetting);
  }

  onLeftMouseDown(mouseEvent){
    // console.log('<- down');
    this.setState({ holdingButton: 'left' });
  }

  onLeftMouseUp(mouseEvent){
    // console.log('<- up');
    if(this.state.holdingButton === 'left'){
      this.stopHoldingButtons();
    }
  }

  onLeftMouseLeave(mouseEvent){
    // console.log('<- leave');
    if(this.state.holdingButton === 'left'){
      this.stopHoldingButtons();
    }
  }


  onRightMouseDown(mouseEvent){
    console.log('-> down');
    this.setState({ holdingButton: 'right' });
  }

  onRightMouseUp(mouseEvent){
    console.log('-> up');
    if(this.state.holdingButton === 'right'){
      this.stopHoldingButtons();
    }
  }

  onRightMouseLeave(mouseEvent){
    console.log('-> leave');
    if(this.state.holdingButton === 'right'){
      this.stopHoldingButtons();
    }
  }

  stopHoldingButtons(){
    this.setState({ holdingButton: null });
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

  render() {
    const dispAngle = parseInt(this.state.angle) + ' degrees';
    const dispApm = `${parseInt(this.state.APMs * 1000)} degrees/second`;
    const dispPercent = `dragging: ${parseInt(this.state.dragXPercent * 100)}%`;

    const framerate = `${parseInt(1000 / this.state.framerate)} fps`;

    return (
      <div className="rotater">
        <div className="rotater-stage">
          <section className="top">
            <p>{dispAngle}</p>
            <p>{dispApm}</p>
            <p>{dispPercent}</p>
            <p>{`framerate: ${framerate}`}</p>
            <input type='range' value={this.state.framerateSetting} min={0.0} max={1.0} step={0.01} onChange={e => this.setFramerate(e.target.value)} />
          </section>

          {this.renderImageContainer(this.props.curSpin, this.state.curIdx)}

          <section className="bottom">
            <div  className="button left" 
                  onMouseDown={e => this.onLeftMouseDown(e)}
                  onMouseUp={e => this.onLeftMouseUp(e)}
                  onMouseLeave={e => this.onLeftMouseLeave(e)} >
            {'<'}
            </div>
            <div className="rotater-pedestal">
            </div>
            <div  className="button right" 
                  onMouseDown={e => this.onRightMouseDown(e)}
                  onMouseUp={e => this.onRightMouseUp(e)}
                  onMouseLeave={e => this.onRightMouseLeave(e)} >
            {'>'}
            </div>
          </section>
        </div>
      </div>
    );
  }
}

import React, { Component } from 'react';

require('./style.less');

const MAX_X = 300;

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
      vX:0,
      dragging: false,
      isSpinning: false,
      angle:0
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

  checkPhysics(){
    const ph = this.props.curSpin.physics;
    // let multiplier = 10;
    let direction = 1;
    let isSpinning = false;
    let isAccelerating = false;
    let angle = this.state.angle;

    //accelerate
    let oldVx = this.state.vX;

    // console.log('. start: ', oldVx);
    let vX = oldVx + Number(this.state.dragXPercent * (ph.speed * ph.aX) * this.props.curSpin.direction);
    console.log('new ', vX);

    if(vX !== 0){
      isSpinning = true;
    }else{
      console.log('cause it is ', vX)
    }

    //find direction
    if(vX < 0){
      direction = -1;
    }

    //drag
    // console.log('was: ', vX);
    vX = vX * ph.frictionX;


    //max out
    if(Math.abs(vX) > ph.maxVx){
      vX = ph.maxVx * direction;
    }
    // console.log('and now: ', vX);

    isAccelerating = oldVx < vX;

    // console.log('oldVx:', oldVx);
    // console.log('vX:', vX);

    //cut off spin when hitting crappy low values
    // if((Math.abs(vX) < Math.abs(ph.minVx)) && isSpinning && !isAccelerating && !this.state.dragging){
    if((Math.abs(vX) < Math.abs(ph.minVx)) && isSpinning && !this.state.dragging){
      console.log('screeeeecchhh');
      vX = 0;
      isSpinning = false;
      this.setState({
        isSpinning:false,
        vX:0
      });
    }else{
      let floater = 100;
      angle = angle + (vX * ph.dampen);
      angle = Math.round(angle * floater) / floater;
      //loop to end
      // console.log('angle: ', angle);

      this.setState({
        isSpinning:true,
        lastTime: new Date().getTime(),
        angle: angle,
        curIdx: this.getFrameAtAngle(angle),
        vX: vX
      });
    }
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

  manualRotation(degrees){
    let angle = this.state.angle + degrees;
    this.setState({
      angle:angle,
      curIdx: this.getFrameAtAngle(angle)
    });
  }

  flickRotation(vX){
    this.setState({
      isSpinning:true,
      vX: this.state.vX + vX
    });
  }

  onSpinInterval(){
    if(this.state.isSpinning){
      this.checkPhysics();
    }

    if(this.state.holdingButton === 'left'){
        //- single frame movement
      this.manualRotation(-1);
        //- lil spin daddy
      //this.flickRotation(-1);

    }else if(this.state.holdingButton === 'right'){
        //- single frame movement
      this.manualRotation(1);
        //- lil spin daddy
      //this.flickRotation(1);
    }
  }

  startSpinInterval(){
    this.killSpinInterval();
    this.spinTicker = global.setInterval(() => {
      this.onSpinInterval();
      // console.log('ticky');
    }, this.props.framerate);
  }

  killSpinInterval(){
    if(this.spinInterval){
      global.clearInterval(this.spinInterval);
      this.spinInterval = null;
    }
  }

  componentDidUpdate(prevProps){
    if(prevProps.framerate !== this.props.framerate){
      console.log('restart interval!')
      this.startSpinInterval();
    }

  }

  componentDidMount(){
    this.startSpinInterval();
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


  render() {

    return (
      <div className="rotater">
        <div className="rotater-stage">
          <section className="top">
            <h1>{this.state.vX}</h1>
            <h1>{this.state.dragXPercent}</h1>
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

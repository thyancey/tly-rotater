import React, { Component } from 'react';

require('./style.less');


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

  componentDidMount(){
    this.setFramerate(this.state.framerateSetting);
  }

  componentDidUpdate(prevProps, prevState){
    if(prevState.framerate !== this.state.framerate){
      this.startSpinInterval(this.state.framerate);
    }
  }










/***
 *    ██████╗ ██████╗  █████╗  ██████╗     ██╗      ██████╗  ██████╗ ██╗ ██████╗
 *    ██╔══██╗██╔══██╗██╔══██╗██╔════╝     ██║     ██╔═══██╗██╔════╝ ██║██╔════╝
 *    ██║  ██║██████╔╝███████║██║  ███╗    ██║     ██║   ██║██║  ███╗██║██║     
 *    ██║  ██║██╔══██╗██╔══██║██║   ██║    ██║     ██║   ██║██║   ██║██║██║     
 *    ██████╔╝██║  ██║██║  ██║╚██████╔╝    ███████╗╚██████╔╝╚██████╔╝██║╚██████╗
 *    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝     ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝ ╚═════╝
 *                                                                              
 */

  //- calc total drag space, and return % of how far you've dragged it
  onDragging(curX, startX){
    let dx = curX - startX;
    const maxDragX = this.refs.imageContainer.offsetWidth / 3;

    //at some point, you've dragged far enough.
    if(Math.abs(dx) > maxDragX){
      dx = maxDragX * (dx < 0 ? -1 : 1);
    }

    const dragXPercent = dx / maxDragX;
    // console.log('perc:', dragXPercent)
    this.setState({ dragXPercent: dragXPercent });
  }

  stopDragging(){
    this.setState({ 
      dragging: false,
      startX: 0,
      dragXPercent: 0
    });
  }






/***
 *    ██████╗ ██╗  ██╗██╗   ██╗███████╗██╗ ██████╗███████╗     ██████╗ █████╗ ██╗      ██████╗
 *    ██╔══██╗██║  ██║╚██╗ ██╔╝██╔════╝██║██╔════╝██╔════╝    ██╔════╝██╔══██╗██║     ██╔════╝
 *    ██████╔╝███████║ ╚████╔╝ ███████╗██║██║     ███████╗    ██║     ███████║██║     ██║     
 *    ██╔═══╝ ██╔══██║  ╚██╔╝  ╚════██║██║██║     ╚════██║    ██║     ██╔══██║██║     ██║     
 *    ██║     ██║  ██║   ██║   ███████║██║╚██████╗███████║    ╚██████╗██║  ██║███████╗╚██████╗
 *    ╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝ ╚═════╝╚══════╝     ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝
 *                                                                                            
 */

  checkPhysics(APMs, lastTime){
    //- grab junk from definition
    const ph = this.props.curSpin.physics;
    const speed = ph.speed;
    const accel = ph.accel;
    const friction = ph.friction;
    const maxAPMs = ph.maxAPMs;
    const minAPMs = ph.minAPMs;
    const spinDirection = this.props.curSpin.direction;


    //- calc time elapsed since last checkPhysics cycle
    const nowTime = new Date().getTime();
    if(!lastTime){
      this.setState({'lastTime': nowTime});
      return;
    }
    const timeDiff = nowTime - lastTime;

  //- TODO: this could probably improved with calculus? I dunno it's been a real long time since I've done any of that.
    //- calc amount of change per millisecond cycle
    const speedChange = (this.state.dragXPercent * accel) * speed * spinDirection;

    //- now apply for all milliseconds that have passed.
    if(this.state.dragging){
      for(let i = 0; i < timeDiff; i++){
        APMs += speedChange;
        //- friction here is a little more realistic, but takes a lot more value tweaking to get max speed, so just dont use it.
        // APMs /= friction;
      }
    }else{
      for(let i = 0; i < timeDiff; i++){
        //- slow down!
        APMs /= friction;
      }
    }

    //- if you're moving slow enough, just go ahead and stop instead of wasting cycles and looking bad
    if(Math.abs(APMs) < minAPMs && !this.state.dragging){
      this.haltSpinning(nowTime);
    }else{
      //- plateu speed if moving too fast
      if(maxAPMs && Math.abs(APMs) > maxAPMs){
        //- make sure you keep the right + or - speed at your max
        APMs = maxAPMs * (APMs > 0 ? 1 : -1);
      }

      //- apply current speed and passed time to actual rotation
      this.applySpin(APMs, timeDiff, nowTime);
    }
  }




  //- apply speed to the spin
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
    console.log('haltSpinning');
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
    const newAngle = this.state.angle + (angleChange * this.props.curSpin.direction);
    const idx = this.getFrameAtAngle(newAngle);

    this.setState({
      angle: newAngle,
      curIdx: idx
    });
  }




/***
 *    ███████╗██████╗ ██╗███╗   ██╗
 *    ██╔════╝██╔══██╗██║████╗  ██║
 *    ███████╗██████╔╝██║██╔██╗ ██║
 *    ╚════██║██╔═══╝ ██║██║╚██╗██║
 *    ███████║██║     ██║██║ ╚████║
 *    ╚══════╝╚═╝     ╚═╝╚═╝  ╚═══╝
 *                                 
 */

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






/***
 *    ███████╗██████╗  █████╗ ███╗   ███╗███████╗██████╗  █████╗ ████████╗███████╗
 *    ██╔════╝██╔══██╗██╔══██╗████╗ ████║██╔════╝██╔══██╗██╔══██╗╚══██╔══╝██╔════╝
 *    █████╗  ██████╔╝███████║██╔████╔██║█████╗  ██████╔╝███████║   ██║   █████╗  
 *    ██╔══╝  ██╔══██╗██╔══██║██║╚██╔╝██║██╔══╝  ██╔══██╗██╔══██║   ██║   ██╔══╝  
 *    ██║     ██║  ██║██║  ██║██║ ╚═╝ ██║███████╗██║  ██║██║  ██║   ██║   ███████╗
 *    ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
 *                                                                                
 */


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







/***
 *    ███████╗██╗   ██╗███████╗███╗   ██╗████████╗    ██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗     ███████╗██████╗ ███████╗
 *    ██╔════╝██║   ██║██╔════╝████╗  ██║╚══██╔══╝    ██║  ██║██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝██╔══██╗██╔════╝
 *    █████╗  ██║   ██║█████╗  ██╔██╗ ██║   ██║       ███████║███████║██╔██╗ ██║██║  ██║██║     █████╗  ██████╔╝███████╗
 *    ██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║   ██║       ██╔══██║██╔══██║██║╚██╗██║██║  ██║██║     ██╔══╝  ██╔══██╗╚════██║
 *    ███████╗ ╚████╔╝ ███████╗██║ ╚████║   ██║       ██║  ██║██║  ██║██║ ╚████║██████╔╝███████╗███████╗██║  ██║███████║
 *    ╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝   ╚═╝       ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝
 *                                                                                                                      
 */

/*
* Dragging the spin around
*/
  onRotaterDragStart(mouseOrTouchEvent){
    // console.log('onRotaterDragStart', mouseOrTouchEvent.changedTouches);
    try{
      let startX;
      if(mouseOrTouchEvent.changedTouches){
        startX = mouseOrTouchEvent.changedTouches[0].clientX;
      }else{
        startX = mouseOrTouchEvent.clientX;
      }

      this.setState({ 
        dragging: true,
        startX: startX,
        lastTime: new Date().getTime(),
        isSpinning:true
      });

    }catch(e){
      console.error('problem with onRotaterDragStart:', e);
    }
  }

  onRotaterDragMove(mouseOrTouchEvent){
    // console.log('onRotaterDragMove', mouseOrTouchEvent.changedTouches);
    if(this.state.dragging){
      try{
        let startX;
        if(mouseOrTouchEvent.changedTouches){
          startX = mouseOrTouchEvent.changedTouches[0].clientX;
        }else{
          startX = mouseOrTouchEvent.clientX;
        }

        this.onDragging(startX, this.state.startX);
      }catch(e){
        console.error('problem with onRotaterDragMove:', e);
      }
    }
  }

  onRotaterDragCancel(mouseOrTouchEvent){
    try{
      mouseOrTouchEvent.preventDefault();
      this.stopDragging();
    }catch(e){
      console.error('problem with onRotaterDragCancel:', e);
    }
  }




/*
* Clicking and holding rotation buttons
*/
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






/***
 *    ██████╗ ███████╗███╗   ██╗██████╗ ███████╗██████╗ ██╗███╗   ██╗ ██████╗ 
 *    ██╔══██╗██╔════╝████╗  ██║██╔══██╗██╔════╝██╔══██╗██║████╗  ██║██╔════╝ 
 *    ██████╔╝█████╗  ██╔██╗ ██║██║  ██║█████╗  ██████╔╝██║██╔██╗ ██║██║  ███╗
 *    ██╔══██╗██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗██║██║╚██╗██║██║   ██║
 *    ██║  ██║███████╗██║ ╚████║██████╔╝███████╗██║  ██║██║██║ ╚████║╚██████╔╝
 *    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ 
 *                                                                            
 */


  renderImageContainer(curSpin, curSpinIdx){
    if(curSpin){
      return (
        <div className="rotater-image-container" 
             ref="imageContainer"
             onMouseDown={e => this.onRotaterDragStart(e)}
             onMouseMove={e => this.onRotaterDragMove(e)}
             onMouseUp={e => this.onRotaterDragCancel(e)}
             onMouseLeave={e => this.onRotaterDragCancel(e)} 

             onTouchStart={e => this.onRotaterDragStart(e)}
             onTouchMove={e => this.onRotaterDragMove(e)}
             onTouchEnd={e => this.onRotaterDragCancel(e)}
             onTouchCancel={e => this.onRotaterDragCancel(e)}>
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

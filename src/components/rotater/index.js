import React, { Component } from 'react';

require('./style.less');

const DEFAULT_FRAMERATE = 33;

export default class Rotater extends Component {
  constructor(){
    super();
    
    this.state = {
      spinId: null,
      startX: 0,
      dragXPercent: 0,
      curIdx: 0,
      lastTime:0,
      angle:0,
      APMs:0,
      dragging: false,
      isSpinning: false
    }
  }

  componentDidMount(){
    this.startSpinInterval(this.props.framerate || DEFAULT_FRAMERATE);
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.framerate !== this.props.framerate){
      this.startSpinInterval(this.props.framerate);
    }

    if(prevProps.curSpin !== this.props.curSpin){
      this.resetSpin();
    }
  }

  resetSpin(){
    this.setState({
      curIdx: 0,
      startX: 0,
      dragXPercent: 0,
      angle: 0,
      APMs: 0,
      dragging: false,
      isSpinning: false
    });
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
    const maxDragX = this.refs.rotater.offsetWidth / 3;

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


  getAdvancedSpeedup(timeDiff, APMs){
    const ph = this.props.curSpin.physics;
    const speed = ph.speed;
    const accel = ph.accel;
    const spinDirection = this.props.curSpin.direction;
    const friction = ph.friction;
    const dragXPercent = this.state.dragXPercent;

    const speedChange = (dragXPercent * accel) * speed * spinDirection;

    for(let i = 0; i < timeDiff; i++){
      APMs += speedChange;
      APMs /= friction;
    }
    return APMs;
  }

  checkPhysics(APMs, lastTime){
    //- grab junk from definition
    const ph = this.props.curSpin.physics;
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

  //- TODO: for loops here could probably improved with calculus? I dunno it's been a real long time since I've done any of that.
    //- calc amount of change per millisecond cycle

    if(this.state.dragging){
      if(this.props.useAcceleration){
        APMs = this.getAdvancedSpeedup(timeDiff, APMs);
      }else{
        APMs = this.state.dragXPercent * maxAPMs * spinDirection;
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
    const newAngle = this.state.angle + (angleChange * this.props.curSpin.direction * this.props.curSpin.physics.manualSpeed);
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

    if(this.props.manualDirection === 'left'){
      this.manualRotation(-1);

    }else if(this.props.manualDirection === 'right'){
      this.manualRotation(1);
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




/***
 *    ██████╗ ███████╗███╗   ██╗██████╗ ███████╗██████╗ ██╗███╗   ██╗ ██████╗ 
 *    ██╔══██╗██╔════╝████╗  ██║██╔══██╗██╔════╝██╔══██╗██║████╗  ██║██╔════╝ 
 *    ██████╔╝█████╗  ██╔██╗ ██║██║  ██║█████╗  ██████╔╝██║██╔██╗ ██║██║  ███╗
 *    ██╔══██╗██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗██║██║╚██╗██║██║   ██║
 *    ██║  ██║███████╗██║ ╚████║██████╔╝███████╗██║  ██║██║██║ ╚████║╚██████╔╝
 *    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ 
 *                                                                            
 */

  renderDebugContainer(){
    const angle = parseInt(this.state.angle);
    const apm = parseInt(this.state.APMs * 1000);
    const dragPercent = parseInt(this.state.dragXPercent * 100);
    const fps = parseInt(1000 / this.props.framerate);
    const direction = this.props.curSpin.direction > 0 ? '>>>' : '<<<';

    return(
      <div className="rotater-debug">
        <ul>
          <li>{`direction: ${direction}`}</li>
          <li>{`frame: ${this.state.curIdx}/${this.props.curSpin.images.length}`}</li>
          <li>{`angle: ${angle} deg`}</li>
          <li>{`deg/sec: ${apm}`}</li>
          <li>{`dragPercent: ${dragPercent}%`}</li>
          <li>{`fps: ${fps}`}</li>
        </ul>
        <div className="rotater-debug-bg" />
      </div>
    );
  }

  render() {
    return (
      <div className="rotater" 
           ref="rotater"
           onMouseDown={e => this.onRotaterDragStart(e)}
           onMouseMove={e => this.onRotaterDragMove(e)}
           onMouseUp={e => this.onRotaterDragCancel(e)}
           onMouseLeave={e => this.onRotaterDragCancel(e)} 

           onTouchStart={e => this.onRotaterDragStart(e)}
           onTouchMove={e => this.onRotaterDragMove(e)}
           onTouchEnd={e => this.onRotaterDragCancel(e)}
           onTouchCancel={e => this.onRotaterDragCancel(e)}>
        {this.props.debug ? this.renderDebugContainer() : null }
        {this.props.curSpin.images.map((si, idx) => (
          <img draggable={false} key={idx} src={si} style={{ 'display': idx === this.state.curIdx ? 'inline' : 'none' }}/>
        ))}
      </div>
    );
  }
}

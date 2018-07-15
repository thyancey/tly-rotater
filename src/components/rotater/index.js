import React, { Component } from 'react';

require('./style.less');

export default class Rotater extends Component {
  constructor(){
    super();
    
    this.state = {
      curIdx: 0,
      curImage: 'images/htcone/closed_000.png',
      holdingButton:null
    }
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
        <div className="rotater-image-container">
          {curSpin.images.map((si, idx) => (
            <img key={idx} src={si} style={{ 'display': idx === curSpinIdx ? 'inline' : 'none' }}/>
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

  onSpinInterval(){
    if(this.state.holdingButton === 'left'){
      this.advanceSpinIndex(this.state.curIdx - 1);
    }else if(this.state.holdingButton === 'right'){
      this.advanceSpinIndex(this.state.curIdx + 1);
    }
  }

  startSpinInterval(){
    this.killSpinInterval();
    this.spinTicker = global.setInterval(() => {
      this.onSpinInterval();
      // console.log('ticky');
    }, 10);
  }

  killSpinInterval(){
    if(this.spinInterval){
      global.clearInterval(this.spinInterval);
      this.spinInterval = null;
    }
  }

  componentDidMount(){
    this.startSpinInterval();
  }

  onLeftMouseDown(mouseEvent){
    console.log('<- down');
    this.setState({ holdingButton: 'left' });
  }

  onLeftMouseUp(mouseEvent){
    console.log('<- up');
    if(this.state.holdingButton === 'left'){
      this.stopHoldingButtons();
    }
  }

  onLeftMouseLeave(mouseEvent){
    console.log('<- leave');
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
            <h1>{this.props.curSpin.title}</h1>
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

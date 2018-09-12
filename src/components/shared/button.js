import React, { Component } from 'react';

require('./button.less');

export default class Button extends Component {
  render() {
    return (
      <div  className={`button ${this.props.direction}`} 
            onMouseDown={e => this.props.onPress(e, this.props.direction)}
            onMouseUp={e => this.props.onRelease(e, this.props.direction)}
            onMouseLeave={e => this.props.onRelease(e, this.props.direction)} 
            onTouchStart={e => this.props.onPress(e, this.props.direction)}
            onTouchEnd={e => this.props.onRelease(e, this.props.direction)} >
        {this.props.children}
      </div>
    );
  }
}

import React, { Component } from 'react'
import {Button} from 'react-bootstrap'

export default class LogginButtons extends Component {
  render(){
    return (
      <>
        <Button variant="primary" onClick={() => {
          window.location = 'https://churchmusictheory.com/wp-login.php'
        }}>{'Log In'}
        </Button>
        <Button variant="primary" onClick={() => {
          window.location = 'https://churchmusictheory.com/register'
        }}>
          {'New Account'}
        </Button>
      </>
    )
  }
}

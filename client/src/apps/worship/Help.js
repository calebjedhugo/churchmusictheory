import React, { Component } from 'react';
import {Card} from 'react-bootstrap';

export default class Help extends Component{
  render(){
    return (
      <Card>
        <Card>
          <Card.Header>Recording</Card.Header>
          <Card.Body>
            <p>{'For best results, listen to the reference recording using wired headphones'}</p>
            <p>{`Your recording can get behind for a variety of reasons. Bluetooth devices,
              in particular, have a delay of a least 50 ms. Use the delay fixer to correct this. The default is 6 ms
              since all systems have at least a little delay. But you also might just be singing behind the recording.
              Try another take if you sound behind.`}</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Header>Microphone Access</Card.Header>
          <Card.Body>
            <p>{'A lot of the tech used to make this work is just coming out, but it does work! For best results, use the browser recommended for your device.'}</p>
            <p>{'If you accidentally deny the site access to your microphone:'}</p>
            <p>{'iOS (Safari): refresh the page and try again. Also, you have to use Safari; this detail is out of my control.'}</p>
            <p>{'Android (Chrome): tap the lock symbol in the upper-left and allow microphone access.'}</p>
            <p>{'Desktop: tap the microphone symbol in the address bar after clicking a microphone. Then allow microphone access.'}</p>
          </Card.Body>
        </Card>
      </Card>
    )
  }
}

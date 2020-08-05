import React, { Component } from 'react'
import {Form, InputGroup} from 'react-bootstrap'
import {apiPath} from '../../App.js'

export default class Latency extends Component{
  saveLatency = () => {
    const {latency, id} = this.props
    window.jquery.ajax({
      type: 'POST',
      data: {
        action: 'latency',
        latency: latency,
        id: id
      },
      url: apiPath
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){this.setState({error: data})}
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this.setState({loading: false})
    })
  }

  render(){
    const {setLatency, latency, maxLatency} = this.props
    return(
      <>
        <Form>
          <Form.Group controlId="latency">
            <Form.Label>Delay Fixer</Form.Label>
            <InputGroup>
              <Form.Control min={0} max={maxLatency} value={latency} onChange={setLatency} type="number"
                onBlur={this.saveLatency}/>
              <InputGroup.Prepend>
                <InputGroup.Text id="latencyPrepend">ms</InputGroup.Text>
              </InputGroup.Prepend>
            </InputGroup>
          </Form.Group>
        </Form>

      </>
    )
  }
}

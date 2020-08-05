import React, { Component } from 'react';
import {Form, Spinner} from 'react-bootstrap';
import {apiPath} from '../../App.js'

export default class RoleChanger extends Component{
  constructor(props){
    super(props)
    this.state = {
      loading: false,
      selected: this.props.selected
    }
  }

  changeRole = (e) => {
    const {setMembers, id} = this.props
    this.setState({loading: true, selected: e.target.value})
    window.jquery.ajax({
      type:'POST',
      data:{
        action:'change_role',
        id: id,
        role: e.target.value
      },
      url: `${apiPath}`,
    }).done((data) => {
      try{data = JSON.parse(data)}
      catch(e){throw new Error(data)}
      setMembers(data)
      this.setState({error: ''})
    }).fail((xrh, status, e) => {
      this.setState({error: xrh.responseText})
      console.error(xrh.responseText)
    }).always(() => {
      this.setState({loading: false})
    })
  }

  render(){
    const {loading, error, selected} = this.state
    const {id} = this.props
    return (
      <>
        <Form>
          <Form.Group controlId={`roleSelect${id}`}>
            <Form.Control size='sm' value={selected} onChange={this.changeRole} as="select">
              <option value='musician'>musician</option>
              <option value='singer'>singer</option>
              <option value='listener'>listener</option>
              <option value='troll'>troll</option>
            </Form.Control>
          </Form.Group>
        </Form>
        {loading ? <Spinner animation="border" variant="primary" /> : null}
        {error ? <div className={'errorMessage'}>{error}</div> : null}
      </>
    )
  }
}

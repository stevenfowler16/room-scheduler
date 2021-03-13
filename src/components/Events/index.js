import React from 'react'
import eventsService from '../../utils/events-service'
import sortByDate from '../../utils/sortByDate'
import ContentEditable from '../ContentEditable'
import analytics from '../../utils/analytics'

export default class Events extends React.Component{
    state = {
        events: []
      }
      componentDidMount() {

        /* Track a page view */
        analytics.page()
    
        // Fetch all todos
        eventsService.readAll().then((events) => {
          if (events.message === 'unauthorized') {
            if (isLocalHost()) {
              alert('FaunaDB key is not unauthorized. Make sure you set it in terminal session where you ran `npm start`. Visit http://bit.ly/set-fauna-key for more info')
            } else {
              alert('FaunaDB key is not unauthorized. Verify the key `FAUNADB_SERVER_SECRET` set in Netlify enviroment variables is correct')
            }
            return false
          }
    
          console.log('all events', events)
          this.setState({
            events: events
          })
        })
      }
    renderEvents() {
        const { events } = this.state
    
        if (!events || !events.length) {
          // Loading State here
          return null
        }
    
        const timeStampKey = 'ts'
        const orderBy = 'desc' // or `asc`
        const sortOrder = sortByDate(timeStampKey, orderBy)
        const todosByDate = events.sort(sortOrder)
    
        return todosByDate.map((location, i) => {
          const { data, ref } = location
          const id = getLocationId(location)
          // only show delete button after create API response returns
          let deleteButton
          if (ref) {
            deleteButton = (
              <button data-id={id} onClick={this.deleteLocation}>
                delete
              </button>
            )
          }
          return (
            <div key={i} className='location-item'>
              <label className="todo">
           
                <div className='location-list-title'>
                  <ContentEditable
                    tagName='span'
                    editKey={id}
                    onBlur={this.updateLocationName} // save on enter/blur
                    html={data.name}
                    // onChange={this.handleDataChange} // save on change
                  />
                  <div>{data.startTime}</div>
                  <label>{data.endTime}</label>
                </div>
              </label>
              {deleteButton}
            </div>
          )
        })
      }
      saveEvent = (e) => {
        e.preventDefault()
        const { events } = this.state
   

        const eventName = this.nameElement.value
        const eventStartTime = this.startTimeElement.value;
        const endTime = this.endTimeElement.value;
        if (!eventName) {
          alert('Please add Location Name')
          this.nameElement.focus()
          return false
        }
    
        // reset input to empty
        this.nameElement.value = ''
    
        const event = {
          name: eventName,
          startTime:eventStartTime,
          endTime:endTime
        }
        // Optimistically add todo to UI
        const newTodoArray = [{
          data: event,
          ts: new Date().getTime() * 10000
        }]
    
        const optimisticTodoState = newTodoArray.concat(events)
    
        this.setState({
            events: optimisticTodoState
        })
        // Make API request to create new todo
        eventsService.create(event).then((response) => {
          console.log(response)
          /* Track a custom event */
          analytics.track('eventCreated', {
            category: 'events',
            label: eventName,
          })
          // remove temporaryValue from state and persist API response
          const persistedState = removeOptimisticLocation(events).concat(response)
          // Set persisted value to state
          this.setState({
            events: persistedState
          })
        }).catch((e) => {
          console.log('An API error occurred', e)
          const revertedState = removeOptimisticLocation(events)
          // Reset to original state
          this.setState({
            events: revertedState
          })
        })
    }
    deleteLocation = (e) => {
        const { events } = this.state
        const eventId = e.target.dataset.id
    
        // Optimistically remove todo from UI
        const filteredEvents = events.reduce((acc, current) => {
          const currentId = getLocationId(current)
          if (currentId === eventId) {
            // save item being removed for rollback
            acc.rollbackTodo = current
            return acc
          }
          // filter deleted todo out of the todos list
          acc.optimisticState = acc.optimisticState.concat(current)
          return acc
        }, {
          rollbackTodo: {},
          optimisticState: []
        })
    
        this.setState({
            events: filteredEvents.optimisticState
        })
    
        // Make API request to delete todo
        eventsService.delete(eventId).then(() => {
          console.log(`deleted event id ${eventId}`)
          analytics.track('eventDeleted', {
            category: 'events',
          })
        }).catch((e) => {
          console.log(`There was an error removing ${eventId}`, e)
          // Add item removed back to list
          this.setState({
            events: filteredEvents.optimisticState.concat(filteredEvents.rollbackTodo)
          })
        })
      }
    render(){
        return (
      
            <div className='location-list'>
            <h2>
              Create Event
            </h2>
            <form className='location-create-wrapper' onSubmit={this.saveEvent} >
              <input
                className='create-input'
                placeholder='Add a name'
                name='name'
                ref={el => this.nameElement = el}
                autoComplete='off'
                style={{marginRight: 20}}
              />
              <input
                className='create-input'
                placeholder='Add a start time'
                name='startTime'
                ref={el => this.startTimeElement = el}
                autoComplete='off'
                style={{marginRight: 20}}
                type='datetime-local'
              />
                <input
                className='create-input'
                placeholder='Add a end time'
                name='endTime'
                ref={el => this.endTimeElement = el}
                autoComplete='off'
                style={{marginRight: 20}}
                type='datetime-local'
              />
              <div className='todo-actions'>
                <button className='todo-create-button'>
                  Create
                </button>     
              </div>
            </form>
  
            {this.renderEvents()}
          </div>
       
        )
    }
}


function getLocationId(location) {
    if (!location.ref) {
      return null
    }
    return location.ref['@ref'].id
  }

  
function removeOptimisticLocation(locations) {
    // return all 'real' todos
    return locations.filter((locations) => {
      return locations.ref
    })
  }
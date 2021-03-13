import React, { Component } from 'react'
import ContentEditable from './components/ContentEditable'
import AppHeader from './components/AppHeader'
import SettingsMenu from './components/SettingsMenu'
import SettingsIcon from './components/SettingsIcon'
import analytics from './utils/analytics'
import api from './utils/api'
import sortByDate from './utils/sortByDate'
import isLocalHost from './utils/isLocalHost'
import Events from './components/Events'
import './App.css'
import {BrowserRouter as Router,
Switch,
Route,
Link} from "react-router-dom"
export default class App extends Component {
  state = {
    locations: [],
    showMenu: false
  }
  componentDidMount() {

    /* Track a page view */
    analytics.page()

    // Fetch all todos
    api.readAll().then((locations) => {
      if (locations.message === 'unauthorized') {
        if (isLocalHost()) {
          alert('FaunaDB key is not unauthorized. Make sure you set it in terminal session where you ran `npm start`. Visit http://bit.ly/set-fauna-key for more info')
        } else {
          alert('FaunaDB key is not unauthorized. Verify the key `FAUNADB_SERVER_SECRET` set in Netlify enviroment variables is correct')
        }
        return false
      }

      console.log('all locations', locations)
      this.setState({
        locations: locations
      })
    })
  }
  saveTodo = (e) => {
    e.preventDefault()
    const { locations } = this.state
    const locationName = this.inputElement.value

    if (!locationName) {
      alert('Please add Location Name')
      this.inputElement.focus()
      return false
    }

    // reset input to empty
    this.inputElement.value = ''

    const location = {
      name: locationName
    }
    // Optimistically add todo to UI
    const newTodoArray = [{
      data: location,
      ts: new Date().getTime() * 10000
    }]

    const optimisticTodoState = newTodoArray.concat(locations)

    this.setState({
      locations: optimisticTodoState
    })
    // Make API request to create new todo
    api.create(location).then((response) => {
      console.log(response)
      /* Track a custom event */
      analytics.track('locationCreated', {
        category: 'locations',
        label: locationName,
      })
      // remove temporaryValue from state and persist API response
      const persistedState = removeOptimisticLocation(locations).concat(response)
      // Set persisted value to state
      this.setState({
        locations: persistedState
      })
    }).catch((e) => {
      console.log('An API error occurred', e)
      const revertedState = removeOptimisticLocation(locations)
      // Reset to original state
      this.setState({
        locations: revertedState
      })
    })
  }
  deleteLocation = (e) => {
    const { locations } = this.state
    const locationId = e.target.dataset.id

    // Optimistically remove todo from UI
    const filteredTodos = locations.reduce((acc, current) => {
      const currentId = getLocationId(current)
      if (currentId === locationId) {
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
      locations: filteredTodos.optimisticState
    })

    // Make API request to delete todo
    api.delete(locationId).then(() => {
      console.log(`deleted location id ${locationId}`)
      analytics.track('locationDeleted', {
        category: 'locations',
      })
    }).catch((e) => {
      console.log(`There was an error removing ${locationId}`, e)
      // Add item removed back to list
      this.setState({
        locations: filteredTodos.optimisticState.concat(filteredTodos.rollbackTodo)
      })
    })
  }
  handleTodoCheckbox = (event) => {
    const { todos } = this.state
    const { target } = event
    const todoCompleted = target.checked
    const todoId = target.dataset.id

    const updatedTodos = todos.map((todo, i) => {
      const { data } = todo
      const id = getLocationId(todo)
      if (id === todoId && data.completed !== todoCompleted) {
        data.completed = todoCompleted
      }
      return todo
    })

    this.setState({
      todos: updatedTodos
    }, () => {
      api.update(todoId, {
        completed: todoCompleted
      }).then(() => {
        console.log(`update todo ${todoId}`, todoCompleted)
        const eventName = (todoCompleted) ? 'todoCompleted' : 'todoUnfinished'
        analytics.track(eventName, {
          category: 'todos'
        })
      }).catch((e) => {
        console.log('An API error occurred', e)
      })
    })
  }
  updateLocationName = (event, currentValue) => {
    let isDifferent = false
    const locationId = event.target.dataset.key

    const updateLocations = this.state.locations.map((location, i) => {
      const id = getLocationId(location)
      if (id === locationId && location.data.name !== currentValue) {
        location.data.name = currentValue
        isDifferent = true
      }
      return location
    })

    // only set state if input different
    if (isDifferent) {
      this.setState({
        locations: updateLocations
      }, () => {
        api.update(locationId, {
          name: currentValue
        }).then(() => {
          console.log(`update location ${locationId}`, currentValue)
          analytics.track('locationUpdated', {
            category: 'locations',
            label: currentValue
          })
        }).catch((e) => {
          console.log('An API error occurred', e)
        })
      })
    }
  }
  clearCompleted = () => {
    const { todos } = this.state

    // Optimistically remove todos from UI
    const data = todos.reduce((acc, current) => {
      if (current.data.completed) {
        // save item being removed for rollback
        acc.completedTodoIds = acc.completedTodoIds.concat(getLocationId(current))
        return acc
      }
      // filter deleted todo out of the todos list
      acc.optimisticState = acc.optimisticState.concat(current)
      return acc
    }, {
      completedTodoIds: [],
      optimisticState: []
    })

    // only set state if completed todos exist
    if (!data.completedTodoIds.length) {
      alert('Please check off some todos to batch remove them')
      this.closeModal()
      return false
    }

    this.setState({
      todos: data.optimisticState
    }, () => {
      setTimeout(() => {
        this.closeModal()
      }, 600)

      api.batchDelete(data.completedTodoIds).then(() => {
        console.log(`Batch removal complete`, data.completedTodoIds)
        analytics.track('todosBatchDeleted', {
          category: 'todos',
        })
      }).catch((e) => {
        console.log('An API error occurred', e)
      })
    })
  }
  closeModal = (e) => {
    this.setState({
      showMenu: false
    })
    analytics.track('modalClosed', {
      category: 'modal'
    })
  }
  openModal = () => {
    this.setState({
      showMenu: true
    })
    analytics.track('modalOpened', {
      category: 'modal'
    })
  }
  renderLocations() {
    const { locations } = this.state

    if (!locations || !locations.length) {
      // Loading State here
      return null
    }

    const timeStampKey = 'ts'
    const orderBy = 'desc' // or `asc`
    const sortOrder = sortByDate(timeStampKey, orderBy)
    const todosByDate = locations.sort(sortOrder)

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
            </div>
          </label>
          {deleteButton}
        </div>
      )
    })
  }
  render() {
    return (
      <div className='app'>
        
        <AppHeader />

        <div className='location-list'>
          <h2>
            Create Location
            <SettingsIcon onClick={this.openModal} className='mobile-toggle' />
          </h2>
          <form className='location-create-wrapper' onSubmit={this.saveTodo}>
            <input
              className='create-input'
              placeholder='Add a location'
              name='name'
              ref={el => this.inputElement = el}
              autoComplete='off'
              style={{marginRight: 20}}
            />
            <div className='todo-actions'>
              <button className='todo-create-button'>
                Create location
              </button>
              <SettingsIcon onClick={this.openModal}  className='desktop-toggle' />
            </div>
          </form>

          {this.renderLocations()}
        </div>
        <SettingsMenu
          showMenu={this.state.showMenu}
          handleModalClose={this.closeModal}
          handleClearCompleted={this.clearCompleted}
        />
        <Events />
      </div>
    )
  }
}

function removeOptimisticLocation(locations) {
  // return all 'real' todos
  return locations.filter((locations) => {
    return locations.ref
  })
}

function getLocationId(location) {
  if (!location.ref) {
    return null
  }
  return location.ref['@ref'].id
}

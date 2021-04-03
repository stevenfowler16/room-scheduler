import React from 'react'
import api from '../../utils/api'
import eventsService from '../../utils/events-service'
import analytics from '../../utils/analytics'
import sortByDate from '../../utils/sortByDate'
import Dropdown from 'react-dropdown';
import Calendar from '../Calendar'
export default class LocationAvailability extends React.Component{
    state ={
        locations:[],
        locationOptions: [],
        eventsForCurrentLocation:[],
        currentLocation:{}
    }
    loadEventsForLocation= (e) =>{
      e.preventDefault()
      // const date = this.dateElement.value;
      const locationId = this.locationDropdown.state.selected.value;
        
        eventsService.searchByLocation(locationId).then((response) => {
            console.log(response)
            /* Track a custom event */
            analytics.track('eventsFound', {
              category: 'events',
              label: locationId,
            })
           
            // Set persisted value to state
            this.setState({
                eventsForCurrentLocation: response
            })
          }).catch((e) => {
            console.log('An API error occurred', e)
        
            this.setState({
              locations: []
            })
          })
    }
    componentDidMount() {

        /* Track a page view */
        analytics.page()
    
         // Fetch all locations
         api.readAll().then((locations) => {
            if (locations.message === 'unauthorized') {
              if (isLocalHost()) {
                alert('FaunaDB key is not unauthorized. Make sure you set it in terminal session where you ran `npm start`. Visit http://bit.ly/set-fauna-key for more info')
              } else {
                alert('FaunaDB key is not unauthorized. Verify the key `FAUNADB_SERVER_SECRET` set in Netlify enviroment variables is correct')
              }
              return false
            }
      
            console.log('all events', locations)
            const options = locations.map(location =>{
                return {value:getLocationId(location), label:location.data.name}
            })
            this.setState({
                locationOptions: options,
                locations:locations
            })
          })
      } 
      renderEvents() {
        const { eventsForCurrentLocation } = this.state

        if (!eventsForCurrentLocation || !eventsForCurrentLocation.length) {
          console.log("null?")
            // Loading State here
          return null
        }

        const timeStampKey = 'ts'
        const orderBy = 'desc' // or `asc`
        const sortOrder = sortByDate(timeStampKey, orderBy)
        const locationsByDate = eventsForCurrentLocation.sort(sortOrder)

        return locationsByDate.map((event, i) => { 
            const { data } = event
            console.log(data)
          return (
            <div key={i} className='location-item'>
              <label className="todo">
           
                <div className='location-list-title'>
                  <div> {data.name}</div>
                  <div>{formatDate(data.startTime)}</div>
                  <div>{formatDate(data.endTime)}</div>
                </div>
              </label>
            
            </div>
          )
        })
      }
    render(){
        return (
        <div className='location-list'>
          <form className='location-create-wrapper flex-direction-col' onSubmit={this.loadEventsForLocation} >
        <h2>Choose Location</h2>
        <Dropdown ref={el => this.locationDropdown = el} options={this.state.locationOptions}  placeholder="Select an option" />
        {/* <label>Date</label>
        <input
                className='create-input'
                name='date'
                ref={el => this.dateElement = el}
                autoComplete='off'
                style={{marginRight: 20}}
                type='date'
        /> */}
        <div className='todo-actions'>
                <button className='todo-create-button'>
                  Get Events
                </button>     
        </div> 
      
        </form>
        
        <Calendar events={this.state.eventsForCurrentLocation}></Calendar>
        </div>
        )
    }

}

function formatDate(date){
  let dateFormat = new Intl.DateTimeFormat('en-US',{dateStyle:"medium",timeStyle:'medium'});
  console.log(date)
  try{
    return dateFormat.format(date);
  }
  catch{
    return "";
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
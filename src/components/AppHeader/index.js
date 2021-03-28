import React from 'react'
import { NavLink } from 'react-router-dom'
import logo from '../../assets/logo.svg'

import styles from './AppHeader.css' // eslint-disable-line

const AppHeader = (props) => {
  return (
    <header className='app-header'>
      <div className='app-title-wrapper flex-direction-col'>
        <div className='app-title-wrapper mr-auto'>
          <div className='app-left-nav'>
            <img src={logo} className='app-logo' alt='logo' />
            <div className='app-title-text'>
              <h1 className='app-title'>Room Scheduler</h1>
              <p className='app-intro'>
               Schedule Rooms Easily
              </p>
            </div>

          </div>
          
        </div>
        <div className="d-flex font-white">
            <NavLink className="nav-item" activeClassName="nav-item-active" to="/locations">Locations</NavLink>
            <NavLink className="nav-item" activeClassName="nav-item-active" to="/events">Events</NavLink>
            <NavLink className="nav-item" activeClassName="nav-item-active" to="/locationAvailablity">Location Availability</NavLink>
          </div>
      </div>
    </header>
  )
}

export default AppHeader

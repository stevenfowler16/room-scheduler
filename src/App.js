import React, { Component } from "react";
import AppHeader from "./components/AppHeader";
import SettingsMenu from "./components/SettingsMenu";
import Events from "./components/Events";
import LocationAvailability from "./components/LocationAvailability";
import Locations from "./components/Locations"
import "./App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  BrowserRouter,
} from "react-router-dom";
export default class App extends Component {
 
  render() {
    return (
      <BrowserRouter>
        <div className="app">
          <AppHeader />

          <Switch>
            <Route path="/LocationAvailability">
              <LocationAvailability />
            </Route>
            <Route path="/locations">
              <Locations />
            </Route>
            <Route path="/">
              <Events />
            </Route>
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

function removeOptimisticLocation(locations) {
  // return all 'real' todos
  return locations.filter((locations) => {
    return locations.ref;
  });
}

function getLocationId(location) {
  if (!location.ref) {
    return null;
  }
  return location.ref["@ref"].id;
}

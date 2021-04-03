import React from 'react'
import {formatDate} from '../../utils/convert-date'

import styles from './Calendar.css' // eslint-disable-line

export default class Calendar extends React.Component {
    constructor(props){
        super(props)
        this.state= {
              date: 1617449810195, 
              day: new Date(1617449810195).getDay()
            }     
    }
    state ={
        events:[],
        date:Number,
        day:Number
    }
    render(){
        return(
            <div>
                Calendar
                <Day date="1617449810195" events={this.props.events}></Day>
            </div>
        )
    }
}

class Day extends React.Component{ 
    state ={
        events:[],
        date:Number,
        timeBlocks:[]
    }
    constructor(props){
        super(props)
        this.state= {
                timeBlocks:this.createTimeBlocks()
            }     
    }
    createTimeBlocks(){
        let results = [];
        for(var i = 0; i< 24;i++){
            results.push(new Date().setHours(i))
        }
        return results;
    }
    filterEventsForTimeBlock(time){
        return this.props.events.filter((element )=>{
            let calendarDate = new Date(time);
            let eventDate = new Date(element.data.startTime)           
            if(eventDate.getHours() == calendarDate.getHours() && calendarDate.getDay() == eventDate.getDay()){
                console.log(`Event Found${element}`)
                return element;
            }
            console.log(`Event Not Found`)
        })
    }
   
    render(){
        return (
            <div>
                {formatDate(this.props.date,{dateStyle:"medium"})}
                {
                    this.state.timeBlocks.map(timeBlock => (
                        <div className={'time-block'} key={timeBlock}>
                            <div>{formatDate(timeBlock,{hour:"numeric"})}</div>
                            <div>
                                {
                                    
                                   this.filterEventsForTimeBlock(timeBlock).map(event =>(
                                       <div className={'calendar-event-item'} key={event.data.startTime}>
                                            <div>{event.data.name}</div>
                                            <div>{formatDate(event.data.startTime,{timeStyle:"medium"})}</div>
                                            <div>{formatDate(event.data.endTime,{timeStyle:"medium"})}</div>
                                       </div>
                                   ))
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        )
    }
}




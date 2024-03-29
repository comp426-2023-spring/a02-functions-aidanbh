#! /usr/bin/env node

// "type": "module" requires import instead of require

import moment from "moment-timezone"
import minimist from "minimist"
import fetch from "node-fetch"

// parse arguments
const args = minimist(process.argv.slice(2))

// check for help flag

if (args.h || args.help) {
  console.log(`Usage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE
    -h            Show this help message and exit.
    -n, -s        Latitude: N positive; S negative.
    -e, -w        Longitude: E positive; W negative.
    -z            Time zone: uses tz.guess() from moment-timezone by default.
    -d 0-6        Day to retrieve weather: 0 is today; defaults to 1.
    -j            Echo pretty JSON from open-meteo API and exit.`)

   process.exit(0)
}

// get system timezone 
var timezone = moment.tz.guess()
var lat, lon

// get arguments
if (args.n) {
  lat = args.n
} else if (args.s) {
  lat = -(args.s)
} else {
  console.log('Latitude must be in range.')
}

if (args.e) {
  lon = args.e
} else if (args.w) {
  lon = -(args.w)
} else {
  console.log('Longitude must be in range.')
}

if (args.z) timezone = args.z


// because 0 is a false value, if (args.d) does not work
var days = (args.d===undefined) ? 1 : args.d

// make request to API
const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,sunrise,precipitation_sum,precipitation_hours&timezone=${timezone}`)

const data = await response.json()

// just print output if requested
if (args.j) {
  // pretty print JSON (per SO 5670752)
  console.log(JSON.stringify(data, null, " "))
  process.exit(0)
}

// otherwise, report rain boolean for chosen day
var daystr

switch (days) {
  case 0:
    daystr = 'today'
    break;
  case 1:
    daystr = 'tomorrow'
    break;  
  default:
    daystr = `in ${days} days`
}

console.log(`You ${data.daily.precipitation_hours[days] > 0 ? 'might' : 'will not'} need your galoshes ${daystr}.`)

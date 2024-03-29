import clock from "clock";
import * as messaging from "messaging";
import { peerSocket } from "messaging";
import document from "document";
import { HeartRateSensor } from "heart-rate";
import { battery } from "power";
import { charger } from "power";
import { preferences } from "user-settings";
import { today } from "user-activity";
import * as clockutil from "../common/clockutils";
import { display } from "display";
import { units } from "user-settings";
import { locale } from "user-settings";
import { user } from "user-profile";
import * as fs from "fs";
import { me } from "appbit";
import { me as device } from "device";
import { BodyPresenceSensor } from "body-presence";


//SVG elements
const timeLable = document.getElementById("timeLable");
const hourLable = document.getElementById("hourLable");
const minuteLable = document.getElementById("minuteLable");
const replacetimeLable = document.getElementById("replacetimeLable");
const replacehourLable = document.getElementById("replacehourLable");
const replaceminuteLable = document.getElementById("replaceminuteLable");
const USDATE = "US";
const EUDATE = "Europe";
const DISTANCEKM = "Km";
const DISTANCEMI = "Miles";
let cDateFormat = EUDATE;
let cDistanceUnit = DISTANCEKM;
let hrLable = document.getElementById("hrm");
let batLable = document.getElementById("batLable");
let stepLable = document.getElementById("stepLable");
let kmLable = document.getElementById("kmLable");
let dateLable = document.getElementById("dateLable");
let myElement = document.getElementById("myElement");
let heartpic = document.getElementById("heartpic");
let stepspic = document.getElementById("stepspic");
let floorspic = document.getElementById("floorspic");
let replaceLable = document.getElementById("replaceLable");
let replaceHeartLable = document.getElementById("replaceHeartLable");
let hrmrestLable = document.getElementById("hrmrestLable");
let floorsLable = document.getElementById("floorsLable");
let calspic = document.getElementById("calspic");
let calsLable = document.getElementById("calsLable");
let heartrestpic = document.getElementById("heartrestpic");
let batpic = document.getElementById("batpic");
let heartpicsvg = document.getElementById("heartpicsvg");
let batpicsvg = document.getElementById("batpicsvg");
let stepspicsvg = document.getElementById("stepspicsvg");
let medidsvg = document.getElementById("medidsvg");
let medidsvgrep = document.getElementById("medidsvgrep");
let medinfosvg = document.getElementById("medinfosvg");
let medidname = document.getElementById("medidname");
let medidcond = document.getElementById("medidcond");
let medidice = document.getElementById("medidice");
let animgroup = document.getElementById("animgroup");
let animgrouprep = document.getElementById("animgrouprep");
let medid = document.getElementById("medid");
let medidrep = document.getElementById("medidrep");

heartrestpic.style.visibility = "hidden";
floorspic.style.visibility = "hidden";
calspic.style.visibility = "hidden";
medidname.style.visibility= "hidden";
medidcond.style.visibility= "hidden";
medidice.style.visibility= "hidden";
medidsvgrep.style.visibility= "hidden";

console.log((user.restingHeartRate || "Unknown") + " BPM");
console.log("Locale: " + locale.language);
console.log("from user settings: " + units.distance);

var todays = new Date();
var hrm = new HeartRateSensor();
var autochange = false;
var nighttime = false; //reserved
var staticColor = false;
var staticColorValue = "#1B2C40";
var colorhours = 0;

// minute clock
clock.granularity = "minutes";

// setup initial values
hrLable.text = "--";
batLable.text = "--%";

const SETTINGS_TYPE = "cbor";
const SETTINGS_FILE = "settings.cbor";

//set defaults and vals from settings on device
let settings = null;
setDefaults();
setMedInfo();

function setDefaults() {
  try {
      settings = loadSettings();  
      console.log("settings.selectedDate: " + settings.selectedDate);
      console.log("settings.selectedUnits: " + settings.selectedUnits);
      cDateFormat = settings.selectedDate;
      cDistanceUnit = settings.selectedUnits;
      console.log("settings loaded:" + settings);
  } catch (ex) {
      console.log("exception message: " + ex.message)
  }
}


me.onunload = saveSettings();

function loadSettings() {
  try {
    console.log("trying to read settings");
    settings = fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
    console.log("Load Settings: settings.selectedUnits: " + settings.selectedUnits);
    console.log("Load Settings: settings.selectedDate: " + settings.selectedDate);
    console.log("Load Settings: settings.textName: " + settings.textName);
    console.log("Load Settings: settings.textCond: " + settings.textCond);
    console.log("Load Settings: settings.textICE: " + settings.textICE);
    
    if (settings == null) {
      return {
      //defaults if not settings made
      selectedDate: JSON.stringify(EUDATE),
      selectedUnits: JSON.stringify(DISTANCEKM)
      }  
    } else {
      console.log("Returning loaded settings");
      return settings;
    }
    setMedInfo();
  } catch (ex) {
    // Defaults
    console.log("no settings file: " + ex);
    return {
      //defaults if not settings made
      selectedDate: JSON.stringify(EUDATE),
      selectedUnits: JSON.stringify(DISTANCEKM)
    }
  }
}

function setMedInfo() {
  if (settings.textName == null) {
    medidname.text = "Not Set";  
  } else {
    medidname.text = settings.textName; //JSON.stringify(settings.textName);  
  }
  

  if (settings.textCond == null) {
    medidcond.text = "Not Set";
  } else {
    medidcond.text = settings.textCond; //JSON.stringify(settings.textCond);  
  }

    if (settings.textICE == null) {
    medidice.text = "Not Set";  
   } else {
    medidice.text = settings.textICE; //JSON.stringify(settings.textICE);  
  }
}

function saveSettings() {
  console.log("In settings Save: ");
  fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE);
}

// Determine locale and units
// update for version 1.2.2
function setDistanceUnits()
{
  console.log("in setdistance");
  var localelang = locale.language;
  var userunits = units.distance;
  var num = (today.local.distance/1000);
    
  //if (localelang.toLowerCase() == "en-us" || localelang.toLowerCase() == "en-gb" && userunits.toLowerCase() != "metric") {
  if (userunits.toLowerCase() != "metric") {
      if (cDistanceUnit == DISTANCEMI) {
        num = ((today.local.distance/1000) * 0.62137);
        var n = num.toFixed(3);
        kmLable.text = n + " mi";
        console.log("mi - US");
      } else {
        num = (today.local.distance/1000);
        var n = num.toFixed(3);
        kmLable.text = n + " km";
        console.log("km - US");
      }
  } else {
      if (cDistanceUnit == DISTANCEKM) {
        num = (today.local.distance/1000);
        var n = num.toFixed(3);
        kmLable.text = n + " km";
        console.log("km - EU");
      } else {
        num = ((today.local.distance/1000) * 0.62137);
        var n = num.toFixed(3);
        kmLable.text = n + " mi";
        console.log("mi - EU");
      }
    console.log("cDistanceUnit :" + cDistanceUnit); 
        
  }
  settings.selectedUnits = cDistanceUnit;
}

// update for version 1.2.2
function setDateFormat() {
  //so date gets updated more quickly
  todays = new Date();
  var localelang = locale.language;
  var userunits = units.distance;
    
  if (localelang.toLowerCase() == "en-us") {
      if (cDateFormat == EUDATE) {
        dateLable.text = todays.getDate() + "-" + (todays.getMonth() + 1) + "-" + todays.getFullYear();
      } else  {
          dateLable.text = (todays.getMonth() + 1) + "-" + todays.getDate() + "-" + todays.getFullYear();  
      }
    } else {
      if (cDateFormat == USDATE) {
        dateLable.text = (todays.getMonth() + 1) + "-" + todays.getDate() + "-" + todays.getFullYear();
      } else {
        dateLable.text = todays.getDate() + "-" + (todays.getMonth() + 1) + "-" + todays.getFullYear();
      }
    }
  settings.selectedDate = cDateFormat;
}
  

setDistanceUnits();
setDateFormat();

// Want heart rate to be constantly updated
hrm.onreading = function() {
  if (display.on) {
    console.log("heart rate: " + hrm.heartRate);
    hrLable.text = hrm.heartRate;
    replaceHeartLable.text = hrm.heartRate;
  }
}

batLable.text = Math.floor(battery.chargeLevel) + "%"; 
stepLable.text = today.local.steps;

hrm.start();

// clock update event handler
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = clockutil.zeroPad(hours);
  }
  let mins = clockutil.zeroPad(today.getMinutes());
  colorhours = hours;
  hourLable.text = `${hours}`;
  minuteLable.text = `${mins}`;
  if (replacehourLable.style.visible != "hidden") {
    replaceminuteLable.text = minuteLable.text;
    replacehourLable.text = hourLable.text;
  } 
}

// update display with stats only when display is switched on
// saves battery - better than doing it in clock ticks - every minute
display.onchange = () => {
  
  console.log("Units: " + units.distance);
  console.log("Locale: " + locale.language);
  //update other stats
  if (display.on) {
    stepLable.text = today.local.steps;
    if (autochange == true) {
      //randomly change colors throught the day every minute
      myElement.gradient.colors.c2 = randomColors();
    }
    
    setDistanceUnits();
    setDateFormat();
    batLable.text = Math.floor(battery.chargeLevel) + "%"; 
    
    //display real(ish) heart rate on pulsating heart image
    let imageanimate = document.getElementById("imageanimate");
    imageanimate.dur= 60/hrm.heartRate;
    batpic.style.opacity = Math.floor(battery.chargeLevel) / 100;
  }
  
  saveSettings();
}
               
// make a black background and dim forground colors for quieter night viewing- reserved
function invertColors() {
  myElement.style.fill = "black";
  stepLable.style.fill = "blue";
  kmLable.style.fill = "blue";
  batLable.style.fill = "blue";
  timeLable.style.fill = "blue";
}

// go back to initial static color or time chosen color - reserved
function revertColor() {
      myElement.style.fill = staticColorValue;
      stepLable.style.fill = "black";
      kmLable.style.fill = "black";
      batLable.style.fill = "black";
      timeLable.style.fill = "black";
}

hrLable.onmousedown = function(e) {
  hideAll();
  arrangeScreenOnHrLableClick();
}

heartpicsvg.onmousedown = function(e) {
  hideAll();
  arrangeScreenOnHrLableClick()
}

function arrangeScreenOnHrLableClick() {
  heartpic.style.visibility = "visible";
  replaceHeartLable.style.fontSize = 60;
  replaceHeartLable.style.visibility= "visible";
  replaceHeartLable.text = hrLable.text;
  hourLable.style.visibility= "hidden";
  timeLable.style.visibility= "hidden";
  minuteLable.style.visibility= "hidden";
  hrmrestLable.style.fontSize = 40;
  hrmrestLable.text = (user.restingHeartRate || "Unknown");
  hrmrestLable.style.visibility = "visible";
  heartrestpic.style.visibility = "visible";
}

hrmrestLable.onmousedown = function(e) {
  showAll();
  replaceLable.style.visibility= "hidden";
  hourLable.style.visibility= "visible";
  timeLable.style.visibility= "visible";
  minuteLable.style.visibility= "visible";
  hrmrestLable.style.visibility = "hidden";
  heartrestpic.style.visibility = "hidden";
  heartpic.style.visibility = "visible";
  hrmrestLable.style.visibility = "hidden";
  replaceHeartLable.style.visibility = "hidden";
}

batLable.onmousedown = function(e) {
  hideAll();
  replaceLable.style.fontSize = 60;
  replaceLable.style.visibility= "visible";
  replaceLable.text = batLable.text;
  hourLable.style.visibility= "hidden";
  timeLable.style.visibility= "hidden";
  minuteLable.style.visibility= "hidden";
  batpic.style.visibility= "visible";
}

batpic.onmousedown = function(e) {
  hideAll();
  arrangeScreenOnBatPicClick()
}

batpicsvg.onmousedown = function(e) {
  hideAll();
  arrangeScreenOnBatPicClick()
}

function arrangeScreenOnBatPicClick() {
  replaceLable.style.fontSize = 60;
  replaceLable.style.visibility= "visible";
  replaceLable.text = batLable.text;
  hourLable.style.visibility= "hidden";
  timeLable.style.visibility= "hidden";
  minuteLable.style.visibility= "hidden";
  batpic.style.visibility= "visible";
}

stepLable.onmousedown = function(e) {
  hideAll();
  arrangeScreenOnStepsPicClick();
}

stepspic.onmousedown = function(e) {
  hideAll();
  arrangeScreenOnStepsPicClick();
}

stepspicsvg.onmousedown = function(e) {
  hideAll();
  arrangeScreenOnStepsPicClick();
}

function arrangeScreenOnStepsPicClick() {
  stepspic.style.visibility = "visible";
  replaceLable.style.fontSize = 60;
  replaceLable.style.visibility= "visible";
  replaceLable.text = stepLable.text;
  hourLable.style.visibility= "hidden";
  timeLable.style.visibility= "hidden";
  minuteLable.style.visibility= "hidden";
  console.log(device.modelName);
  if (device.modelName.toLowerCase() == "ionic" || device.modelName.toLowerCase() == "versa" ) {
    floorspic.style.visibility = "visible";
    floorsLable.style.fontSize = 40;
    floorsLable.text = (today.local.elevationGain || 0);
    floorsLable.style.visibility = "visible";
  }
}

floorsLable.onmousedown = function(e) {
  showAll();
  replaceLable.style.visibility= "hidden";
  hourLable.style.visibility= "visible";
  timeLable.style.visibility= "visible";
  minuteLable.style.visibility= "visible";
  floorsLable.style.visibility = "hidden";
  floorspic.style.visibility = "hidden";
}

calsLable.onmousedown = function(e) {
  showAll();
  replaceLable.style.visibility= "hidden";
  hourLable.style.visibility= "visible";
  timeLable.style.visibility= "visible";
  minuteLable.style.visibility= "visible";
  calsLable.style.visibility = "hidden";
  calspic.style.visibility = "hidden";
}

kmLable.onmousedown = function(e) {
  hideAll();
  replaceLable.style.fontSize = 60;
  replaceLable.style.visibility= "visible";
  replaceLable.text = kmLable.text;
  hourLable.style.visibility= "hidden";
  timeLable.style.visibility= "hidden";
  minuteLable.style.visibility= "hidden";
  calspic.style.visibility = "visible";
  calsLable.style.fontSize = 40;
  calsLable.text = (today.local.calories || 0);
  calsLable.style.visibility = "visible";
}

dateLable.onmousedown = function(e) {
  hideAll();
  replaceLable.style.fontSize = 60;
  replaceLable.style.visibility= "visible";
  replaceLable.text = dateLable.text;
  hourLable.style.visibility= "hidden";
  timeLable.style.visibility= "hidden";
  minuteLable.style.visibility= "hidden";
}

timeLable.onmousedown = function(e) {
  hideAll();
  showreplacetimeLables();
}

function showreplacetimeLables() {
  replacetimeLable.text = timeLable.text;
  replacehourLable.text = hourLable.text;
  replaceminuteLable.text = minuteLable.text;
  replacetimeLable.style.visibility= "visible";
  replacehourLable.style.visibility= "visible";
  replaceminuteLable.style.visibility= "visible";
  timeLable.style.visibility= "hidden";
  hourLable.style.visibility= "hidden";
  minuteLable.style.visibility= "hidden";
  hrmrestLable.style.visibility = "hidden";
  floorsLable.style.visibility = "hidden";
  floorspic.style.visibility = "hidden";
  calsLable.style.visibility = "hidden";
  calspic.style.visibility = "hidden";
  heartrestpic.style.visibility = "hidden";
  heartpic.style.visibility = "hidden";
}

hourLable.onmousedown = function(e) {
  hideAll();
  showreplacetimeLables();
}

minuteLable.onmousedown = function(e) {
  hideAll();
  showreplacetimeLables();
}
  
replaceLable.onmousedown = function(e) {
  showAll();
  replaceLable.style.visibility= "hidden";
  hourLable.style.visibility= "visible";
  timeLable.style.visibility= "visible";
  minuteLable.style.visibility= "visible";
  hrmrestLable.style.visibility = "hidden";
  floorsLable.style.visibility = "hidden";
  floorspic.style.visibility = "hidden";
  calsLable.style.visibility = "hidden";
  calspic.style.visibility = "hidden";
  heartrestpic.style.visibility = "hidden";
  heartpic.style.visibility = "visible";
  hrmrestLable.style.visibility = "hidden";
}

replaceHeartLable.onmousedown = function(e) {
  showAll();
  replaceHeartLable.style.visibility= "hidden";
  hourLable.style.visibility= "visible";
  timeLable.style.visibility= "visible";
  minuteLable.style.visibility= "visible";
  hrmrestLable.style.visibility = "hidden";
  floorsLable.style.visibility = "hidden";
  floorspic.style.visibility = "hidden";
  calsLable.style.visibility = "hidden";
  calspic.style.visibility = "hidden";
  heartrestpic.style.visibility = "hidden";
  heartpic.style.visibility = "visible";
  hrmrestLable.style.visibility = "hidden";
}

replacetimeLable.onmousedown = function(e) {
  gobacktoMainScreen();
}

replacehourLable.onmousedown = function(e) {
  gobacktoMainScreen();
}

replaceminuteLable.onmousedown = function(e) {
  gobacktoMainScreen();
}

medidsvg.onmousedown = function(e) {
  displayMedinfo();
}

medidsvgrep.onmousedown = function(e) {
  hideMedinfo();
}

medidname.onmousedown = function(e) {
  hideMedinfo();
}

medidcond.onmousedown = function(e) {
  hideMedinfo();
}

medidice.onmousedown = function(e) {
  hideMedinfo();
}


function displayMedinfo() {
  //get from settings
  gobacktoMainScreen();
  console.log("in displaymedinfo");
  hideAll();
  hourLable.style.visibility= "hidden";
  timeLable.style.visibility= "hidden";
  minuteLable.style.visibility= "hidden";
  medidname.style.visibility= "visible";
  medidcond.style.visibility= "visible";
  medidice.style.visibility= "visible";
  medidsvgrep.style.visibility= "visible";
}

function hideMedinfo() {
  //get from settings
  console.log("in displaymedinfo");
  showAll();
  medidname.style.visibility= "hidden";
  medidcond.style.visibility= "hidden";
  medidice.style.visibility= "hidden";
  medidsvgrep.style.visibility= "hidden";
  hourLable.style.visibility= "visible";
  timeLable.style.visibility= "visible";
  minuteLable.style.visibility= "visible";
}


function gobacktoMainScreen() {
  showAll();
  replaceLable.style.visibility= "hidden";
  hourLable.style.visibility= "visible";
  timeLable.style.visibility= "visible";
  minuteLable.style.visibility= "visible";
  hrmrestLable.style.visibility = "hidden";
  floorsLable.style.visibility = "hidden";
  floorspic.style.visibility = "hidden";
  calsLable.style.visibility = "hidden";
  calspic.style.visibility = "hidden";
  heartrestpic.style.visibility = "hidden";
  hrmrestLable.style.visibility = "hidden";
  replaceHeartLable.style.visibility = "hidden";
  replacetimeLable.style.visibility= "hidden";
  replacehourLable.style.visibility= "hidden";
  replaceminuteLable.style.visibility= "hidden";

}

function hideAll () {
  console.log("replacetimelable clicked");
  hrLable.style.visibility = "hidden";
  batLable.style.visibility = "hidden";
  stepLable.style.visibility = "hidden";
  kmLable.style.visibility = "hidden";
  dateLable.style.visibility = "hidden";
  heartpic.style.visibility = "hidden";
  stepspic.style.visibility = "hidden";
  batpic.style.visibility = "hidden";
  replacetimeLable.style.visibility= "hidden";
  replacehourLable.style.visibility= "hidden";
  replaceminuteLable.style.visibility= "hidden";
}

function showAll () {
  hrLable.style.visibility = "visible";
  batLable.style.visibility = "visible";
  stepLable.style.visibility = "visible";
  kmLable.style.visibility = "visible";
  dateLable.style.visibility = "visible";
  heartpic.style.visibility = "visible";
  stepspic.style.visibility = "visible";
  batpic.style.visibility = "visible";
}


//Message is received
messaging.peerSocket.onmessage = evt => {
  console.log(`App received: ${JSON.stringify(evt)}`);
  
  if (evt.data.key === "selectedDate" && evt.data.newValue) {
    let dateChoice = JSON.parse(evt.data.newValue);
    console.log("Setting dateformat2:" + dateChoice.selected);
    console.log("Setting dateformat4:" + evt.data.newValue);
    if (dateChoice.selected == 0) {
      cDateFormat = USDATE;
    } else {
      cDateFormat = EUDATE;
    }
    setDateFormat();
    settings.selectedDate = cDateFormat;
  }
  
  if (evt.data.key === "selectedUnits" && evt.data.newValue) {
    let unitChoice = JSON.parse(evt.data.newValue);
    console.log("Setting unit choice:" + unitChoice.selected);
    console.log("Setting unit choice:" + evt.data.newValue);
    if (unitChoice.selected == 0) {
      cDistanceUnit = DISTANCEKM;
    } else {
      cDistanceUnit = DISTANCEMI;
    }
    console.log("Setting unit choice cDistanceUnit: " + cDistanceUnit);
    setDistanceUnits();
    settings.selectedUnits = cDistanceUnit;
  }
  
  if (evt.data.key === "textName" && evt.data.newValue) {
    let nameSetting = JSON.parse(evt.data.newValue);
    console.log("Setting nameSetting:" + evt.data.newValue);
    medidname.text = nameSetting.name;
    settings.textName = nameSetting.name;
  }
  
  if (evt.data.key === "textCond" && evt.data.newValue) {
    let condSetting = JSON.parse(evt.data.newValue);
    console.log("Setting condSetting:" + evt.data.newValue);
    medidcond.text = condSetting.name;
    settings.textCond = condSetting.name;
  }
  
  if (evt.data.key === "textICE" && evt.data.newValue) {
    let iceSetting = JSON.parse(evt.data.newValue);
    console.log("Setting iceSetting:" + iceSetting.name);
    medidice.text = "ICE Call: " + iceSetting.name;
    settings.textICE = iceSetting.name;
  }
};

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("App Socket Closed");
};

//body sensing
const bodyPresence = new BodyPresenceSensor();
lookforBody();

function lookforBody() {
  if (BodyPresenceSensor) {
     console.log("This device has a BodyPresenceSensor!");
     bodyPresence.addEventListener("reading", () => {
       console.log(`The device is ${bodyPresence.present ? '' : 'not'} on the user's body.`);
     });
     bodyPresence.start();
   
  } else {
     console.log("This device does NOT have a BodyPresenceSensor!");
  }
}


bodyPresence.onreading = function() {
  console.log("in bodypresence reader");
  if (charger.connected == false) {
    console.log("lookforBody: " + bodyPresence.present);
    //change to == after testing
    if (bodyPresence.present == false) {
       //vibration.start("ring");
              //animate ICE logo
       //animgroup.animate("enable");
      animgroup.animate("enable");
    } else {
      animgroup.animate("disable");
    }
  }
}


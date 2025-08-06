let backendUrl = "https://rany.ing"
let userid = require("./config.json")["userid"];
fetch(`${backendUrl}/config/gitpull?userid=${userid}`).then(data=>data.text()).then(data=>{
    console.log(data)
})
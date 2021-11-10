const fs       = require('fs')
const md5      = require('md5')
const request  = require('request')
const uuid     = require('uuid')
const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const did       = md5('kakatojixiaomi').slice(0,16)
const file_name = 'data.json'

const url       = path => `https://api.zcash.m-l.tech/zcash/${path}`
const ip_rand   = () => [0,0,0,0].map(x => Math.floor(Math.random()*255).toString()).join('.')

const headersx  = (ktok=null, adv=null, type=null) => {
  let headers = {
    'user-agent': "android/Freeltc v1.12",
    'Content-Type': "application/x-www-form-urlencoded",
    'Host': "api.zcash.m-l.tech"
  }
  if(ktok)
    headers.ktok = ktok
  if(adv)
    headers.adv  = adv
  if(type)                                                        headers.type = type
  return headers
}

const headers = {
   'Content-Type': "application/x-www-form-urlencoded",
   'Host': "api.zcash.m-l.tech",
   'User-Agent': "okhttp/5.0.0-alpha.2"
}


async function Login(email, pass){
  return await new Promise(resv => {
    request.post({url: url('user/login'), strictSSL: false, form: {
      userOemail: email,
      passcode: pass
    }, headers: headers }, (err, res, body) => {
     resv(JSON.parse(body))
    })
  })
}

async function Reload(email, pass, username, did, dname, uuid, token){
  return await new Promise(resv => {
    request.post({url: url('user/reload'), form: {
      userOemail: email,
      passcode: pass,
      username: username,
      device_id: did,
      device_name: dname,
      idfa: uuid
    }, headers: headersx(token)}, (err, res, body) => {
      resv(JSON.parse(body))
    })
  })

}

async function Bonus(email, pass, ip, token){
  return await new Promise(resv => {
    request.post({url: url('user/bonus'), form: {
      userOemail: email,
      passcode: pass,
      ip: ip
    }, headers: headersx(token)}, (err, res, body) => {
      resv(JSON.parse(body))
    })
  })

}

async function Adv(email, pass, ip, token, adv, type='bonus'){
  return await new Promise(resv => {
    request.post({url: url('user/adv'), form: {
      userOemail: email,
      passcode: pass,
      ip: ip
    }, headers: headersx(token, adv, type)}, (err, res, body) => {
      resv(JSON.parse(body))
    })
  })

}

async function Sv(email, pass, ip, token, adv, type='bonus'){
  return await new Promise(resv => {
    request.post({url: url('user/sv'), form: {
      userOemail: email,
      passcode: pass,
      ip: ip
    }, headers: headersx(token, adv, type)}, (err, res, body) => {
      resv(JSON.parse(body))
    })
  })

}


async function Ch(email, pass, ip, token, adv, type='bonus'){
  return await new Promise(resv => {
    request.post({url: url('user/ch'), form: {
      userOemail: email,
      passcode: pass,
      ip: ip
    }, headers: headersx(token, adv, type)}, (err, res, body) => {
      resv(JSON.parse(body))
    })
  })

}

function main(){
  const data = JSON.parse(fs.readFileSync(file_name, {
     encoding: 'utf8'
  }))

  setInterval(async(resv) => {
    let login  = await Login(data.email, data.pass)
    console.log(login)
    let reload = await Reload(
      login.email,
      data.pass,
      login.username,
      did,
      login.username,
      uuid.v4(),
      login.token
    )

    let bonus  = await Bonus(
      data.email,
      data.pass,
      ip_rand(),
      login.token
    )

    console.log(`
      ~${bonus.message}

      [@] username : ${reload.username}
      [$] Balance  : ${reload.totalEarned}

    ${'~'.repeat(50)}

    `)

    let adv = Adv(
      reload.email,
      data.pass,
      ip,
      login.token,
      bonus.rollID,
      'bonus'
    )
    let sv = Sv(
      reload.email,
      data.pass,
      ip,
      login.token,
      bonus.rollID,
      'bonus'
    )
    let ch = Ch(
      reload.email,
      data.pass,
      ip,
      login.token,
      bonus.rollID,
      'bonus'
    )

    if(bonus.status === 'wrong')
    {
       for(var i=0;i<60*80;i++){
         const date = new Date(Date.now())
         await new Promise(resv => setTimeout(resv, 1000))
         process.stdout.clearLine()
         process.stdout.cursorTo(0)
         process.stdout.write(`\r[*] ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)
       }
    }

  }, 0)
}


if(!fs.existsSync(file_name)) {
  rl.question('[@] email: ', (email) => {
    rl.question('[#] passw: ', (pass) => {
      fs.writeFileSync(file_name, JSON.stringify({
        email: email,
        pass: pass
      }))
      rl.close()
    })
  })
  rl.on('close', main)
} else main()

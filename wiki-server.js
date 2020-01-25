//----------------
// Wikiのwebサーバー(メインプログラム)
//----------------

// databaseに接続
const db = require('./server/database')

//Webサーバを起動
const express = require('express')
const app = express()
const portNo = 3001
// body-parserを有効にする
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
app.listen(portNo, () => {
  console.log('起動しました', `http://localhost:${portNo}`)
})

//APIの定義
// ユーザー追加用のAPI
app.get('/api/adduser',(req,res) => {
  const userid = req.query.userid
  const passwd = req.query.passwd
  if (userid === '' || passwd ==='') {
    return res.json({status: false, msg: 'パラメーターが空'})
  }
  // 既存ユーザーのチェック
  db.getUser(userid, (user) => {
    if (user) { //既にユーザーがいる
      return res.json({status: false, msg: '既にユーザーがいます'})
    }
    //新規追加
    db.addUser(userid, passwd, (token) => {
      if (!token) {
        res.json({status: false, msg: 'DBのエラー'})
      }
      res.json({status: true, token})
    })
  })
})

//ユーザーログイン用のAPI,ログインするとトークンを返す
app.get('/api/login', (req, res) => {
  const userid = req.query.userid
  const passwd = req.query.passwd
  db.login(userid, passwd, (err, token) => {
    if (err) {
      res.json({status: false, msg: '認証エラー'})
      return
    }
    //ログインに成功したらトークンを返す
    res.json({status: true, token})
  })
})

// 友達追加API
app.get('/api/add_friend', (req,res) => {
  const userid = req.query.userid
  const token = req.query.token
  const friendid = req.query.friendid
  db.checkToken(userid, token, (err, user) => {
    if (err) { //認証エラー
      res.json({status: false, msg: '認証エラー'})
      return
    }
    // 友達追加
    user.friends[friendid] = true
    db.updateUser(user, (err) => {
      if (err) {
        res.json({status: false, msg: 'DBエラー'})
        return
      }
      res.json({status: true})
    })
  })
})

// 自分のタイムラインに発言
app.get('/api/add_timeline', (req,res) => {
  const userid = req.query.userid
  const token = req.query.token
  const comment = req.query.comment
  const time = (new Date()).getTime()
  db.checkToken(userid, token, (err, user) => {
    if (err) {
      res.json({status: false, msg: '認証エラー'})
      return
    }
    // タイムラインに追加
    const item = {userid, comment, time}
    db.timelineDB.insert(item, (err, it) => {
      if (err) {
        res.json({status: false, msg: 'DBエラー'})
        return
      }
      res.json({status: true, timelineid: it._id})
    })
  })
})

// ユーザーの一覧を取得
app.get('/api/get_allusers', (req,res) => {
  db.userDB.find({}, (err, docs) => {
    if (err) return res.json({status: false})
    const users = docs.map(e => e.userid)
    res.json({status: true, users})
  })
})

// ユーザー情報を取得
app.get('/api/get_user', (req,res) => {
  const userid = req.query.userid
  db.getUser(userid, (user) => {
    if (!user) return res.json({status: false})
    res.json({status: true, friends: user.friends})
  })
})

// 友達のタイムラインを取得
app.get('/api/get_friends_timeline', (req,res) => {
  const userid = req.query.userid
  const token = req.query.token
  db.getFriendsTimeline(userid, token, (err, docs) => {
    if (err) {
      res.json({status: false, msg: err.toString()})
      return
    }
    res.json({status: true, timelines: docs})
  })
})
// Wikiデータを返すAPI
app.get('/api/get/:wikiname', (req,res) => {
  const wikiname = req.params.wikiname
  db.wikiDB.find({name: wikiname}, (err, docs) => {
    if (err) {
      res.join({status: false, msg: err})
      return
    }
    if (docs.length === 0) {
      docs = [{name: wikiname, body: '', writer:''}]
    }
    res.json({status: true, data: docs[0]})
  })
})

//Wikiデータを書き込むAPI
app.post('/api/put/:wikiname', (req, res) => {
  const wikiname = req.params.wikiname
  console.log('/api/put/' + wikiname, req.body) // req.bodyは改行ごとの分の足し算
  //既存のエントリがあるか確認
  db.wikiDB.find({'name': wikiname}, (err, docs) => {
    if (err) {
      res.json({status: false, msg: err})
      return
    }
    const body = req.body.body
    const writer = req.body.writer
    console.log(writer)
    if (docs.length === 0) { //エントリーがなければ
      db.wikiDB.insert({name:wikiname, body, writer})
    } else { //既存のエントリを更新
      db.wikiDB.update({name: wikiname}, {name: wikiname,body,writer})
    }
    res.json({status: true})
  })
})

//静的ファイルを自動的に返すようルーティングする
app.use('/public',express.static('./public'))
app.use('/login',express.static('./public'))
app.use('/users',express.static('./public'))
app.use('/timeline',express.static('./public'))
app.use('/wiki/:wikiname', express.static('./public'))
app.use('/edit/:wikiname', express.static('./public'))
app.get('/', (req, res) => {
  res.redirect(302, '/wiki/FrontPage')
})

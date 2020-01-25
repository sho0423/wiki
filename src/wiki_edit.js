import React, {Component} from 'react'
import request from 'superagent'
import {Redirect} from 'react-router-dom'
import styles from './styles'

// 編集画面コンポーネント
export default class WikiEdit extends Component {
  //コンポーネントの初期化
  constructor (props) {
    super(props)
    const {params} = this.props.match
    const name = params.name
    this.state = {
      name, body: '', writer: '', loaded: false, jump: ''
    }
  }
  // Wikiの内容を読み込む,編集用なので最終編集者はいらない
  componentWillMount () {
    request
      .get(`/api/get/${this.state.name}`)
      .end((err, res) => {
        if (err) return
        this.setState({
          body: res.body.data.body,
          loaded: true
        })
      })
  }
  // 本文をサーバーにポストする
  save () {
    const wikiname = this.state.name
    request
      .post('/api/put/' + wikiname)
      .type('form')
      .send({
        writer: window.localStorage.sns_id,
        name: wikiname,
        body: this.state.body
      })
      .end((err, data) => {
        if (err) {
          console.log(err)
          return
        }
        this.setState({jump: '/wiki/' + wikiname})
      })
  }
  bodyChanged (e) {
    this.setState({body: e.target.value})
  }
  //編集画面を表示
  render () {
    if (!this.state.loaded) {
      return (<p>読み込み中</p>)
    }
    if (this.state.jump !== '') {
      //メイン画面にリダイレクト
      return <Redirect to={this.state.jump} />
    }
    const name = this.state.name
    return (
      <div style={styles.edit}>
        <h1><a href={`/wiki/${name}`}>{name}</a></h1>
        <textarea rows={12} cols={60}
          onChange={e => this.bodyChanged(e)}
          value={this.state.body} /><br />
        <button onClick={e => this.save()}>保存</button>
      </div>
    )
  }
}
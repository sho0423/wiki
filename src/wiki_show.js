import React from 'react'
import request from 'superagent'
import WikiParser from './wiki_parser'
import styles from './styles'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import LinkIcon from '@material-ui/icons/Link';
import EditIcon from '@material-ui/icons/Edit';
import ChatIcon from '@material-ui/icons/Chat';

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

//Wikiメイン画面表示コンポーネント
class WikiShow extends React.Component {
  constructor (props) {
    super(props) 
    const {params} = this.props.match
    this.state = {
      name: params.name, body: '', writer: '', loaded: false}
  }


  //Wikiの内容を読み込む
  componentWillMount () {
    request
      .get(`/api/get/${this.state.name}`)
      .end((err, res) => {
        if (err) return
        this.setState({
          body: res.body.data.body,
          writer: res.body.data.writer,
          loaded: true
        })
      })
  }
  handleClick() {
    window.localStorage.clear()
    window.location.reload() // ホントはやっちゃダメ(Redux使えば良い)
  }
  // 画面の表示処理
  render () {
    if (!this.state.loaded) return (<p>読み込み中</p>)
    const name = this.state.name
    const body = this.state.body
    const html = this.convertText(body)
    const userid = window.localStorage.sns_id
    const in_out_state = (userid)
      ? (
        <div>
          <p style={styles.right}>
            <Button onClick={this.handleClick}>ログアウト</Button>
          </p>
      </div>
      )
      : (
        <p><a href='/login'><Button variant="outlined" color="primary">ログイン</Button></a></p>
      )
    const edit_timeline = (userid)
      ? (
        <p style={styles.right}>
          <p><a href={`/edit/${name}`}><EditIcon />このページを編集</a></p>
          <p><a href={`/timeline`}><ChatIcon />タイムラインへ</a></p>
        </p>
      )
      : null
    return(
      <div>
        {in_out_state}
        <h4>最終編集者<EditIcon />  {this.state.writer} さん</h4>
        <h1>{this.state.name}</h1>
        <div style={styles.show}>{html}</div>
        {edit_timeline}
      </div>
    )
  }
  //Wiki記法をReactオブジェクトに変換する
  convertText (src) {
    //Wiki記法をパースして配列データに変換
    const nodes = WikiParser.parse(src)
    //各様ををReactの要素に変換
    const lines = nodes.map((e,i) => {
      if (e.tag === 'ul') { //リスト
        const lis = e.items.map(
          (s, j) => <li key={`node${i}_${j}`}>{s}</li>
        )
        return <ul key={`node${i}`}>{lis}</ul>
      }
      if (e.tag === 'a') {
        return (<div key={`node${i}`}>
          <a href={`/wiki/${e.label}`}><LinkIcon />{e.label}</a>
        </div>)
      }
      return React.createElement(
        e.tag, {key: 'node' + i}, e.label)
    })
    return lines
  }
}
export default WikiShow
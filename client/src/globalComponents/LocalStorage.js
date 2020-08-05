export default class LocalStorage {
  /*erredKnowledge*/
  set erredKnowledge(data){
    localStorage.setItem('erredKnowledge', JSON.stringify(data))
  }

  get erredKnowledge(){
    return this.parse('erredKnowledge')
  }

  /*erredRecords*/
  set erredRecords(data){
    localStorage.setItem('erredRecords', JSON.stringify(data))
  }

  get erredRecords(){
    return this.parse('erredRecords')
  }

  parse = k => {
    let s = localStorage.getItem(k)
    try{s = JSON.parse(s)}
    catch(e){
      localStorage.removeItem(k)
      s = []
    }
    return s
  }
}

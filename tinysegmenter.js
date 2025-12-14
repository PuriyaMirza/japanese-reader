function TinySegmenter() {
  var patterns = {
    "[一二三四五六七八九十百千万億兆]":"M",
    "[一-龠々〆ヵヶ]":"H",
    "[ぁ-ん]":"I",
    "[ァ-ヴーｱ-ﾝﾞﾟ]":"K",
    "[a-zA-Zａ-ｚＡ-Ｚ]":"A",
    "[0-9０-９]":"N"
  }
  this.chartype_ = [];
  for (var i in patterns) {
    this.chartype_.push([new RegExp(i), patterns[i]]);
  }
  this.BIAS__ = -332;
  this.BC1__ 

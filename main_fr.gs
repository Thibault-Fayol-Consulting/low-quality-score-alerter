/**
 * low-quality-score-alerter - Script Google Ads for SMBs
 * Author: Thibault Fayol
 */
var CONFIG = { TEST_MODE: true, MIN_QS: 4 };
function main(){
  var kwIter = AdsApp.keywords().withCondition("Status = ENABLED").withCondition("QualityScore < " + CONFIG.MIN_QS).get();
  while(kwIter.hasNext()){
    var kw = kwIter.next();
    Logger.log("Low QS: " + kw.getText() + " (QS: " + kw.getQualityScore() + ")");
    if(!CONFIG.TEST_MODE){ kw.pause(); }
  }
}
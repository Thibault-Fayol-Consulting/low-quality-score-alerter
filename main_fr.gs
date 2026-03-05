/**
 * --------------------------------------------------------------------------
 * low-quality-score-alerter - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Author: Thibault Fayol - Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */
var CONFIG = { TEST_MODE: true, MIN_QS: 4, PAUSE_LOW_QS: true };
function main() {
    Logger.log("Scan des mots-clés au QS faible (< " + CONFIG.MIN_QS + ")...");
    var kwIter = AdsApp.keywords().withCondition("Status = ENABLED").withCondition("CampaignStatus = ENABLED").withCondition("AdGroupStatus = ENABLED").get();
    var count = 0;
    while(kwIter.hasNext()){
        var kw = kwIter.next();
        if (kw.getQualityScore() !== null && kw.getQualityScore() < CONFIG.MIN_QS) {
            Logger.log("QS Faible (" + kw.getQualityScore() + ") : " + kw.getText());
            if(!CONFIG.TEST_MODE && CONFIG.PAUSE_LOW_QS) kw.pause();
            count++;
        }
    }
    Logger.log("A traité " + count + " mots-clés problématiques.");
}

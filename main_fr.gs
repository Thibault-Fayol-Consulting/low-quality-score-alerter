/**
 * --------------------------------------------------------------------------
 * Low Quality Score Alerter — Script Google Ads
 * --------------------------------------------------------------------------
 * Identifie les mots-cles avec un Quality Score faible via GAQL. Rapporte
 * la qualite creative, le CTR predit et la qualite post-clic.
 *
 * Auteur:  Thibault Fayol — Thibault Fayol Consulting
 * Site:    https://thibaultfayol.com
 * Licence: MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  TEST_MODE: true,
  EMAIL: 'vous@exemple.com',
  MIN_QS: 4,
  PAUSE_LOW_QS: false,
  SPREADSHEET_URL: '',
  SHEET_NAME: 'Mots-cles Faible QS'
};

function main() {
  try {
    Logger.log('=== Low Quality Score Alerter ===');
    Logger.log('Seuil : QS < ' + CONFIG.MIN_QS);

    var query =
      'SELECT ad_group_criterion.keyword.text, ' +
      'ad_group_criterion.quality_info.quality_score, ' +
      'ad_group_criterion.quality_info.creative_quality_score, ' +
      'ad_group_criterion.quality_info.search_predicted_ctr, ' +
      'ad_group_criterion.quality_info.post_click_quality_score, ' +
      'campaign.name, ad_group.name ' +
      'FROM keyword_view ' +
      'WHERE ad_group_criterion.quality_info.quality_score < ' + CONFIG.MIN_QS + ' ' +
      'AND ad_group_criterion.status = "ENABLED" ' +
      'AND campaign.status = "ENABLED" ' +
      'AND ad_group.status = "ENABLED"';

    var rows = AdsApp.search(query);
    var lowQs = [];

    while (rows.hasNext()) {
      var row = rows.next();
      lowQs.push({
        text: row.adGroupCriterion.keyword.text,
        qs: row.adGroupCriterion.qualityInfo.qualityScore,
        creative: row.adGroupCriterion.qualityInfo.creativeQualityScore || 'N/A',
        ctr: row.adGroupCriterion.qualityInfo.searchPredictedCtr || 'N/A',
        postClick: row.adGroupCriterion.qualityInfo.postClickQualityScore || 'N/A',
        campaign: row.campaign.name,
        adGroup: row.adGroup.name
      });
    }

    Logger.log('Mots-cles faible QS : ' + lowQs.length);

    for (var i = 0; i < lowQs.length; i++) {
      Logger.log('  QS ' + lowQs[i].qs + ' : "' + lowQs[i].text + '" — ' +
        lowQs[i].campaign + ' > ' + lowQs[i].adGroup);
    }

    if (CONFIG.PAUSE_LOW_QS && !CONFIG.TEST_MODE) { pauseKeywords_(lowQs); }
    if (lowQs.length > 0) sendAlert_(lowQs);
    if (CONFIG.SPREADSHEET_URL && lowQs.length > 0) exportToSheets_(lowQs);

  } catch (e) {
    Logger.log('ERREUR : ' + e.message);
    MailApp.sendEmail(CONFIG.EMAIL, 'Low QS Alerter — Erreur', e.message);
  }
}

function pauseKeywords_(keywords) {
  for (var i = 0; i < keywords.length; i++) {
    var kwIter = AdsApp.keywords()
      .withCondition('Text = "' + keywords[i].text + '"')
      .withCondition('Status = ENABLED')
      .withCondition('CampaignName = "' + keywords[i].campaign + '"')
      .withCondition('AdGroupName = "' + keywords[i].adGroup + '"')
      .get();
    if (kwIter.hasNext()) { kwIter.next().pause(); Logger.log('Pause : "' + keywords[i].text + '"'); }
  }
}

function sendAlert_(keywords) {
  var subject = (CONFIG.TEST_MODE ? '[TEST] ' : '') +
    'Alerte QS Faible — ' + keywords.length + ' mot(s)-cle(s) sous QS ' + CONFIG.MIN_QS;

  var body = 'Rapport Quality Score Faible\n============================\n\n';
  body += 'Mots-cles avec QS < ' + CONFIG.MIN_QS + ' : ' + keywords.length + '\n\n';

  for (var i = 0; i < keywords.length; i++) {
    var kw = keywords[i];
    body += '- "' + kw.text + '" (QS : ' + kw.qs + ')\n';
    body += '  Creatif : ' + kw.creative + ' | CTR : ' + kw.ctr + ' | Post-clic : ' + kw.postClick + '\n';
    body += '  ' + kw.campaign + ' > ' + kw.adGroup + '\n\n';
  }

  body += 'Legende : ABOVE_AVERAGE / AVERAGE / BELOW_AVERAGE\n';
  MailApp.sendEmail(CONFIG.EMAIL, subject, body);
}

function exportToSheets_(keywords) {
  var ss = SpreadsheetApp.openByUrl(CONFIG.SPREADSHEET_URL);
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  sheet.clear();
  sheet.appendRow(['Mot-cle', 'QS', 'Creatif', 'CTR Predit', 'Post-Clic', 'Campagne', 'Groupe']);
  for (var i = 0; i < keywords.length; i++) {
    var kw = keywords[i];
    sheet.appendRow([kw.text, kw.qs, kw.creative, kw.ctr, kw.postClick, kw.campaign, kw.adGroup]);
  }
  Logger.log('Exporte ' + keywords.length + ' lignes vers Sheets.');
}

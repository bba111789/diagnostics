// ═══════════════════════════════════════════════════════════════════
// BrainStorm BI — Google Apps Script v4
// ═══════════════════════════════════════════════════════════════════
 
var BRUNO_EMAIL    = 'b.barandas@brainstormbi.com';
var SPREADSHEET_ID = '1fZq28LDEIYmrSbYu4GHGUDiAixkgN_2eSUw69HnnM30';
var SHEET_BRIEFS   = 'Briefs';
var SHEET_PLAN     = 'Plan';
 
// ───────────────────────────────────────────────────────────────────
// Réception POST
// ───────────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    writeToSheetBriefs(data);
    writeToSheetPlan(data);
    sendEmailBruno(data);
    sendEmailCC(data);   // envoi aux emails fixes si présents
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
 
function doGet(e) {
  return ContentService.createTextOutput('BrainStorm BI — endpoint actif ✓');
}
 
// ───────────────────────────────────────────────────────────────────
// Onglet Briefs
// ───────────────────────────────────────────────────────────────────
function writeToSheetBriefs(data) {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_BRIEFS);
 
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_BRIEFS);
    var headers = [
      'Date', 'Diagnostic', 'Prénom', 'Nom', 'Email',
      'Fonction', 'Entreprise', 'Téléphone',
      'Nb retenues', 'Nb éliminées',
      'Brief rang 1', 'Brief rang 2', 'Brief rang 3',
      'Brief rang 4', 'Brief rang 5', 'Brief rang 6',
      'Suggestions éliminées',
      'Contexte'
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(17, 350);
    sheet.setColumnWidth(18, 300);
  }
 
  var brief   = data.brief    || [];
  var elimine = data.eliminees || [];
 
  sheet.appendRow([
    new Date(data.timestamp || new Date()),
    data.diagnostic  || '',
    data.prenom      || '',
    data.nom         || '',
    data.email       || '',
    data.fonction    || '',
    data.entreprise  || '',
    data.telephone   || '',
    brief.length,
    elimine.length,
    brief[0] || '', brief[1] || '', brief[2] || '',
    brief[3] || '', brief[4] || '', brief[5] || '',
    elimine.join(' | '),
    data.contexte || ''
  ]);
}
 
// ───────────────────────────────────────────────────────────────────
// Onglet Plan
// ───────────────────────────────────────────────────────────────────
function writeToSheetPlan(data) {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_PLAN);
 
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_PLAN);
    var headers = [
      'Date', 'Email', 'Diagnostic',
      'ID suggestion', 'Libellé suggestion',
      'Dans le brief', 'Rang brief',
      'Éliminée', 'Mois plan', 'Année plan',
      'Priorité plan', 'Ligne plan éliminée'
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(5, 380);
  }
 
  var date     = new Date(data.timestamp || new Date());
  var plan     = data.plan     || [];
  var briefIds = data.briefIds || [];
 
  plan.forEach(function(row) {
    var rangBrief = briefIds.indexOf(row.id) !== -1
                    ? briefIds.indexOf(row.id) + 1
                    : '';
    sheet.appendRow([
      date,
      data.email      || '',
      data.diagnostic || '',
      row.id          || '',
      row.label       || '',
      briefIds.indexOf(row.id) !== -1 ? 'Oui' : 'Non',
      rangBrief,
      row.elimine     ? 'Oui' : 'Non',
      row.mois        || '',
      row.annee       || '',
      row.priorite    || '',
      row.planElimine ? 'Oui' : 'Non'
    ]);
  });
}
 
// ───────────────────────────────────────────────────────────────────
// Email Bruno — récap complet
// ───────────────────────────────────────────────────────────────────
function sendEmailBruno(data) {
  var brief   = data.brief    || [];
  var elimine = data.eliminees || [];
  var plan    = data.plan     || [];
 
  var briefLines   = brief.map(function(l, i){ return (i+1) + '. ' + l; }).join('\n');
  var elimineLines = elimine.length
    ? elimine.map(function(l){ return '✗ ' + l; }).join('\n')
    : '(aucune)';
  var planLines = plan.map(function(r) {
    var statut = r.elimine
      ? '[ÉLIMINÉ]'
      : (data.briefIds||[]).indexOf(r.id) !== -1 ? '[RETENU]' : '[Neutre]';
    return statut + ' ' + r.label + '\n'
      + '   → ' + r.mois + '/' + r.annee
      + ' · ' + r.priorite
      + (r.planElimine ? ' · ligne plan éliminée' : '');
  }).join('\n\n');
 
  var subject = '🔑 Nouveau brief — ' + data.diagnostic + ' · ' + data.prenom + ' ' + data.nom;
  var body =
    'Nouveau brief reçu depuis le diagnostic BrainStorm BI\n' +
    '═══════════════════════════════════════\n\n' +
    'DIAGNOSTIC : ' + data.diagnostic + '\n' +
    'Date       : ' + new Date(data.timestamp).toLocaleString('fr-FR') + '\n\n' +
    '── COORDONNÉES ──────────────────────────\n' +
    'Prénom     : ' + data.prenom     + '\n' +
    'Nom        : ' + data.nom        + '\n' +
    'Email      : ' + data.email      + '\n' +
    'Fonction   : ' + data.fonction   + '\n' +
    'Entreprise : ' + data.entreprise + '\n' +
    'Téléphone  : ' + data.telephone  + '\n\n' +
    '── BRIEF RETENU (' + brief.length + ') ──────────────\n' +
    briefLines + '\n\n' +
    '── SUGGESTIONS ÉLIMINÉES (' + elimine.length + ') ──────\n' +
    elimineLines + '\n\n' +
    '── PLAN COMPLET ─────────────────────────\n' +
    planLines + '\n\n' +
    (data.contexte ? '── CONTEXTE ────────────────────────────\n' + data.contexte + '\n\n' : '') +
    '═══════════════════════════════════════\n' +
    'BrainStorm BI · brainstormbi.com';
 
  MailApp.sendEmail({ to: BRUNO_EMAIL, subject: subject, body: body });
}
 
// ───────────────────────────────────────────────────────────────────
// Emails fixes CC — envoyés uniquement si ccEmails présents dans le payload
// Ces emails sont définis au lancement du diagnostic (commentaire Kanban)
// et baked dans le HTML généré par le skill → var CC_EMAILS = [...]
// ───────────────────────────────────────────────────────────────────
function sendEmailCC(data) {
  var ccEmails = data.ccEmails || [];
  if (!ccEmails.length) return; // aucun email défini → on n'envoie rien
 
  var brief = data.brief || [];
  var briefLines = brief.map(function(l, i){ return '  ' + (i+1) + '. ' + l; }).join('\n');
 
  var subject = 'Brief reçu — ' + data.diagnostic + ' · ' + data.prenom + ' ' + data.nom;
  var body =
    'Un brief vient d\'être soumis sur le diagnostic ' + data.diagnostic + '.\n\n' +
    'Contact : ' + data.prenom + ' ' + data.nom + ' · ' + data.email + '\n' +
    (data.entreprise ? 'Entreprise : ' + data.entreprise + '\n' : '') +
    (data.fonction   ? 'Fonction   : ' + data.fonction   + '\n' : '') +
    '\n── PRIORITÉS RETENUES ──────────────────\n' +
    briefLines + '\n' +
    '────────────────────────────────────────\n\n' +
    (data.contexte ? 'Contexte : ' + data.contexte + '\n\n' : '') +
    'BrainStorm BI · brainstormbi.com';
 
  ccEmails.forEach(function(addr) {
    if (addr && addr.indexOf('@') !== -1) {
      MailApp.sendEmail({ to: addr, replyTo: BRUNO_EMAIL, subject: subject, body: body });
    }
  });
}
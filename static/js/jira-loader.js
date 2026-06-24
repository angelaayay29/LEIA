(function () {
  'use strict';

  const SNAPSHOT_URL = 'data/jira-snapshot.json';

  window.LEIA_JIRA_META = null;

  window.loadLeiaJiraSnapshot = function loadLeiaJiraSnapshot() {
    return fetch(SNAPSHOT_URL, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('snapshot fetch failed: ' + res.status);
        return res.json();
      })
      .then(function (snapshot) {
        window.LEIA_JIRA_META = snapshot.meta || null;
        return snapshot;
      });
  };

  window.formatJiraSyncLabel = function formatJiraSyncLabel(meta) {
    if (!meta) return '';
    var synced = meta.syncedAt ? new Date(meta.syncedAt) : null;
    var when = synced && !isNaN(synced.getTime())
      ? synced.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
      : 'unknown';
    return 'Live from ' + (meta.project || 'GST360') + ' Jira'
      + ' · ' + (meta.retroSprint || 'retro') + ' / ' + (meta.planningSprint || 'planning')
      + ' · synced ' + when;
  };
})();

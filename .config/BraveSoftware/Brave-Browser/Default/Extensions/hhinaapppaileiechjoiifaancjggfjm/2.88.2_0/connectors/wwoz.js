'use strict';

const wwozFilter = MetadataFilter.createFilter({
	track: (text) => MetadataFilter.filterWithFilterRules(
		text, wwozFilterRules
	),
});

const wwozFilterRules = [
	{ source: /"(.+?)"/g, target: '$1' },
	{ source: /\s*\[[^\]]+]$/, target: '' },
	{ source: /\s*\([^)]*version\)$/i, target: '' },
];

Connector.playerSelector = '#player';

Connector.artistSelector = '#player .artist';

Connector.trackSelector = '#player .title';

Connector.isPlaying = () => $('#oz-audio-container').hasClass('jp-state-playing');

Connector.applyFilter(wwozFilter);

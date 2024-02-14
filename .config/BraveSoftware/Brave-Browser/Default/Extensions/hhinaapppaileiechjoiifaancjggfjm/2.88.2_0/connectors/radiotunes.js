'use strict';

const playerBar = '#webplayer-region';
const trackArtSelectors = [
	// Radiotunes
	'#art',
	// DI
	'.track-region .artwork img',
];

const filter = MetadataFilter.createFilter({ artist: removeTrailingDash });

Connector.playerSelector = playerBar;

Connector.artistSelector = '.artist-name';

Connector.trackSelector = '.track-name';

Connector.playButtonSelector = '.icon-play';

Connector.currentTimeSelector = '.timeinfo .time';

Connector.durationSelector = '.timeinfo .total';

Connector.getTrackArt = () => {
	const trackArtUrl = Util.extractImageUrlFromSelectors(trackArtSelectors);
	if (trackArtUrl) {
		// Remove 'size' param
		return trackArtUrl.split('?')[0];
	}
	return null;
};

Connector.isPlaying = () => {
	return $('#webplayer-region').attr('data-state') === 'playing';
};

Connector.applyFilter(filter);

function removeTrailingDash(text) {
	return text.replace(/\s-\s$/, '');
}

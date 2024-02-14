'use strict';

/**
 * Song object.
 */
define(() => {
	class Song {
		/**
		 * @constructor
		 * @param {Object} parsedData Current state received from connector
		 * @param {Object} connector Connector match object
		 */
		constructor(parsedData, connector) {
			/**
			 * Safe copy of initial parsed data.
			 * Must not be modified.
			 */
			this.parsed = Object.assign({}, parsedData);

			/**
			 * Post-processed song data, for example auto-corrected.
			 * Initially filled with parsed data and optionally changed
			 * as the object is processed in pipeline. Can be modified.
			 */
			this.processed = { /* Filled in `initProcessedData` method */ };

			/**
			 * Song flags. Can be modified.
			 */
			this.flags = { /* Filled in `initFlags` method */ };

			/**
			 * Optional data. Can be modified.
			 */
			this.metadata = { /* Filled in `initMetadata` method */ };

			this.connectorLabel = connector.label;

			this.initSongData();
		}

		/**
		 * Get song artist.
		 *
		 * @return {String} Song artist
		 */
		getArtist() {
			return this.processed.artist || this.parsed.artist;
		}

		/**
		 * Get song title.
		 *
		 * @return {String} Song title
		 */
		getTrack() {
			return this.processed.track || this.parsed.track;
		}

		/**
		 * Get song album.
		 *
		 * @return {String} Song album
		 */
		getAlbum() {
			return this.processed.album || this.parsed.album;
		}

		/**
		 * Return song's album artist (Optional)
		 * @return {String} Album artist
		 */
		getAlbumArtist() {
			return this.processed.albumArtist || this.parsed.albumArtist;
		}

		/**
		 * Returns song's processed or parsed duration in seconds.
		 * Parsed duration (received from connector) is preferred.
		 *
		 * @return {Number} Song duration
		 */
		getDuration() {
			return this.parsed.duration || this.processed.duration;
		}

		/**
		 * Return the track art URL associated with the song.
		 * Parsed track art (received from connector) is preferred.
		 *
		 * @return {String} Track art URL
		 */
		getTrackArt() {
			return this.parsed.trackArt || this.metadata.trackArtUrl || null;
		}

		/**
		 * Get formatted "Artist - Track" string. Return null if song is empty.
		 *
		 * @return {String} Formatted string
		 */
		getArtistTrackString() {
			if (this.isEmpty()) {
				return null;
			}
			return `${this.getArtist()} — ${this.getTrack()}`;
		}

		/**
		 * Get song unique ID.
		 *
		 * @return {String} Unique ID
		 */
		getUniqueId() {
			return this.parsed.uniqueID;
		}

		/**
		 * Get song source URL.
		 *
		 * @return {String} source URL.
		 */
		getOriginUrl() {
			return this.parsed.originUrl;
		}

		/**
		 * Check if song is empty. Empty song means it's missing
		 * either artist or track title.
		 *
		 * @return {Boolean} True if song is empty; false otherwise
		 */
		isEmpty() {
			return !(this.getArtist() && this.getTrack());
		}

		/**
		 * Check if song is valid. The song means valid if it's known by
		 * scrobbler service or is corrected by the user.
		 *
		 * @return {Boolean} True if song is valid; false otherwise
		 */
		isValid() {
			return this.flags.isValid || this.flags.isCorrectedByUser;
		}

		/**
		 * Check if song equals another song.
		 * @param  {Object} song Song instance to compare
		 * @return {Boolean} Check result
		 */
		equals(song) {
			if (!song) {
				return false;
			}

			if (!(song instanceof Song)) {
				return false;
			}

			const thisUniqueId = this.getUniqueId();
			const otherUniqueId = song.getUniqueId();
			if (thisUniqueId || otherUniqueId) {
				return thisUniqueId === otherUniqueId;
			}

			return this.getArtist() === song.getArtist() &&
				this.getTrack() === song.getTrack() &&
				this.getAlbum() === song.getAlbum();
		}

		/**
		 * Set `Love` status of song.
		 *
		 * This function is supposed to be used by multiple scrobblers
		 * (services). Each service can have different value of `Love` flag;
		 * the behavior of the function is to set `Love` to true, if all
		 * services have the song with `Love` set to true.
		 *
		 * @param  {Boolean} isLoved Flag means song is loved or not
		 * @param  {Boolean} [force=false] Force status assignment
		 */
		setLoveStatus(isLoved, { force = false } = {}) {
			if (force) {
				this.metadata.userloved = isLoved;
				return;
			}

			if (isLoved) {
				if (this.metadata.userloved === undefined) {
					this.metadata.userloved = true;
				}
			} else {
				this.metadata.userloved = false;
			}
		}

		/**
		 * Get a string representing the song.
		 *
		 * @return {String} String representing the object.
		 */
		toString() {
			return JSON.stringify(this, null, 2);
		}

		/**
		 * Get song data to send it to different context.
		 *
		 * @return {Object} Object contain song data
		 */
		getCloneableData() {
			const fieldsToCopy = [
				'parsed', 'processed', 'metadata', 'flags', 'connectorLabel',
			];
			const clonedSong = {};

			for (const field of fieldsToCopy) {
				clonedSong[field] = this[field];
			}

			return clonedSong;
		}

		/**
		 * Set default song info (artist, track, etc).
		 */
		resetInfo() {
			this.initProcessedData();
		}

		/**
		 * Set default song data (flags and metadata only).
		 */
		resetData() {
			this.initFlags();
			this.initMetadata();
		}

		/**
		 * Custom fields can be defined by user.
		 * @type {Array}
		 */
		static get USER_FIELDS() {
			return ['artist', 'track', 'album', 'albumArtist'];
		}

		/**
		 * Fields used to identify song.
		 * @type {Array}
		 */
		static get BASE_FIELDS() {
			return ['artist', 'track', 'album', 'albumArtist'];
		}

		/** Private methods. */

		initSongData() {
			this.initFlags();
			this.initMetadata();
			this.initProcessedData();
		}

		initFlags() {
			this.flags = {
				/**
				* Flag means song is scrobbled successfully.
				* @type {Boolean}
				*/
				isScrobbled: false,

				/**
				* Flag indicated song info is changed or approved by user.
				* @type {Boolean}
				*/
				isCorrectedByUser: false,

				/**
				* Flag indicated song is known by scrobbling service.
				* @type {Boolean}
				*/
				isValid: false,

				/**
				* Flag indicates song is marked as playing by controller.
				* @type {Boolean}
				*/
				isMarkedAsPlaying: false,

				/**
				* Flag means song is ignored by controller.
				* @type {Boolean}
				*/
				isSkipped: false,

				/**
				* Flag means song is replaying again.
				* @type {Boolean}
				*/
				isReplaying: false,
			};
		}

		initMetadata() {
			this.metadata = {
				/**
				 * Flag indicates song is loved by used on service.
				 * @type {Boolean}
				 */
				userloved: undefined,

				/**
				 * Time when song is started playing in UNIX timestamp format.
				 * @type {Number}
				 */
				startTimestamp: Math.floor(Date.now() / 1000),

				label: this.connectorLabel,
			};
		}

		initProcessedData() {
			const fields = [
				'track', 'album', 'artist', 'albumArtist', 'duration',
			];
			for (const field of fields) {
				this.processed[field] = null;
			}
		}
	}

	return Song;
});

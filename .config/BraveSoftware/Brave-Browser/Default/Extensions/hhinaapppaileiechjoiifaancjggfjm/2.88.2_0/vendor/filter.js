/*
 * metadata-filter v1.1.1
 * (c) Web Scrobbler MetadataFilter Team
 * Licensed under the MIT License
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.MetadataFilter = {}));
}(this, (function (exports) { 'use strict';

	/**
	 * Create a new MetadataFilter instance from a given filter set.
	 *
	 * @param filterSet Filter set
	 *
	 * @return MetadataFilter instance
	 */
	function createFilter(filterSet) {
	    return new MetadataFilter(filterSet);
	}
	/**
	 * Create a filter set where each given field has given filter function(s).
	 * Useful to create a filter where multiple fields should be filtered with
	 * the same filter functions.
	 *
	 * @param fields Array of fields to filter
	 * @param filterFn Filter function or array of filter functions
	 *
	 * @return Filter set object
	 */
	function createFilterSetForFields(fields, filterFn) {
	    if (!Array.isArray(fields)) {
	        throw new TypeError(`Invalid 'fields' argument: expected 'string[]', got '${typeof fields}'`);
	    }
	    if (fields.length === 0) {
	        throw new Error("Invalid 'fields' argument: received an empty array");
	    }
	    return fields.reduce((acc, field) => {
	        acc[field] = filterFn;
	        return acc;
	    }, {});
	}
	/**
	 * Base filter object that filters metadata fields by given filter set.
	 *
	 * The filter set is an object containing properties (fields) with filter
	 * functions. Each field can contain a single filter function, or an array of
	 * filter functions.
	 *
	 * The filter function is a pure function which takes a non-empty string and
	 * returns a modified string.
	 *
	 * These filter functions will be applied to a field value passed in
	 * `MetadataFilter.filterField` method.
	 */
	class MetadataFilter {
	    /**
	     * @constructor
	     *
	     * @param filterSet Set of filters
	     *
	     * @throws Throw an error if no filter set is specified
	     */
	    constructor(filterSet) {
	        if (!filterSet) {
	            throw new TypeError('No filter set is specified!');
	        }
	        this.mergedFilterSet = {};
	        this.appendFilters(filterSet);
	    }
	    /**
	     * Filter the field value using filters for the given field.
	     *
	     * @param field Metadata field
	     * @param fieldValue Field value to be filtered
	     *
	     * @return Filtered string
	     *
	     * @throws Throw an error if an invalid field is specified
	     */
	    filterField(field, fieldValue) {
	        if (field in this.mergedFilterSet) {
	            return this.filterText(fieldValue, this.mergedFilterSet[field]);
	        }
	        throw new TypeError(`Invalid filter field: ${field}`);
	    }
	    /**
	     * Append a new filter set.
	     *
	     * @param filterSet Set of filters
	     *
	     * @return Current instance
	     */
	    append(filterSet) {
	        this.appendFilters(filterSet);
	        return this;
	    }
	    /**
	     * Extend the filter by a filter set from a given filter.
	     *
	     * @param filter Filter object
	     *
	     * @return Current instance
	     */
	    extend(filter) {
	        this.appendFilters(filter.mergedFilterSet);
	        return this;
	    }
	    /**
	     * Check if the filter contains filter functions for a given field.
	     *
	     * @param field Field to check
	     *
	     * @return Check result
	     */
	    canFilterField(field) {
	        return field in this.mergedFilterSet;
	    }
	    /**
	     * Return a list of fields that the filter can filter.
	     *
	     * @return List of fields
	     */
	    getFields() {
	        return Object.keys(this.mergedFilterSet);
	    }
	    /**
	     * Filter text using given filters.
	     *
	     * @param text String to be filtered
	     * @param filters Array of filter functions
	     *
	     * @return Filtered string
	     */
	    filterText(text, filters) {
	        if (!text) {
	            return text;
	        }
	        return filters.reduce((text, filter) => filter(text), text);
	    }
	    /**
	     * Wrap given filters into array of filters, if needed.
	     *
	     * @param filters Array of filter functions or filter function
	     *
	     * @return Array of filter funcions
	     */
	    wrapFiltersIntoArray(filters) {
	        if (Array.isArray(filters)) {
	            return filters;
	        }
	        const filterFn = filters;
	        return [filterFn];
	    }
	    /**
	     * Add given filters to current ones.
	     *
	     * @param filterSet Set of filters
	     *
	     * @throws Throw an error if a filter function is not a function
	     */
	    appendFilters(filterSet) {
	        for (const field in filterSet) {
	            if (!(field in this.mergedFilterSet)) {
	                this.mergedFilterSet[field] = [];
	            }
	            const filterFunctions = this.wrapFiltersIntoArray(filterSet[field]);
	            MetadataFilter.validateFilters(filterFunctions);
	            this.mergedFilterSet[field].push(...filterFunctions);
	        }
	    }
	    /**
	     * Assert every function in the given array of objects is a filter function.
	     *
	     * @param filters Array of filter functions
	     *
	     * @throws Throw an error if the assertion is failed
	     */
	    static validateFilters(filters) {
	        for (const filterFn of filters) {
	            if (typeof filterFn === 'function') {
	                continue;
	            }
	            throw new TypeError(`Invalid filter function: expected 'function', got '${typeof filterFn}'`);
	        }
	    }
	}

	/**
	 * Filter rules are an array that contains replace rules.
	 *
	 * Each rule is an object that contains 'source' and 'target' properties.
	 * 'source' property is a string or RegEx object which is replaced by
	 * 'target' property value.
	 */
	/**
	 * Filter rules to remove YouTube suffixes and prefixes from a text.
	 */
	const YOUTUBE_TRACK_FILTER_RULES = [
	    // Trim whitespaces
	    { source: /^\s+|\s+$/g, target: '' },
	    // **NEW**
	    { source: /\*+\s?\S+\s?\*+$/, target: '' },
	    // [whatever]
	    { source: /\[[^\]]+\]/, target: '' },
	    // (whatever version)
	    { source: /\([^)]*version\)$/i, target: '' },
	    // video extensions
	    { source: /\.(avi|wmv|mpg|mpeg|flv)$/i, target: '' },
	    // (LYRICs VIDEO)
	    { source: /\(.*lyrics?\s*(video)?\)/i, target: '' },
	    // (Official Track Stream)
	    { source: /\((of+icial\s*)?(track\s*)?stream\)/i, target: '' },
	    // (official)? (music)? video
	    { source: /\((of+icial\s*)?(music\s*)?video\)/i, target: '' },
	    // (official)? (music)? audio
	    { source: /\((of+icial\s*)?(music\s*)?audio\)/i, target: '' },
	    // (ALBUM TRACK)
	    { source: /(ALBUM TRACK\s*)?(album track\s*)/i, target: '' },
	    // (Cover Art)
	    { source: /(COVER ART\s*)?(Cover Art\s*)/i, target: '' },
	    // (official)
	    { source: /\(\s*of+icial\s*\)/i, target: '' },
	    // (1999)
	    { source: /\(\s*[0-9]{4}\s*\)/i, target: '' },
	    // (HD) / (HQ)
	    { source: /\(\s*(HD|HQ)\s*\)$/, target: '' },
	    // HD / HQ
	    { source: /(HD|HQ)\s?$/, target: '' },
	    // video clip officiel or video clip official
	    { source: /(vid[\u00E9e]o)?\s?clip\sof+ici[ae]l/i, target: '' },
	    // offizielles
	    { source: /of+iziel+es\s*video/i, target: '' },
	    // video clip
	    { source: /vid[\u00E9e]o\s?clip/i, target: '' },
	    // clip
	    { source: /\sclip/i, target: '' },
	    // Full Album
	    { source: /full\s*album/i, target: '' },
	    // (live)
	    { source: /\(live.*?\)$/i, target: '' },
	    // | something
	    { source: /\|.*$/i, target: '' },
	    // Artist - The new "Track title" featuring someone
	    { source: /^(|.*\s)"(.{5,})"(\s.*|)$/, target: '$2' },
	    // 'Track title'
	    { source: /^(|.*\s)'(.{5,})'(\s.*|)$/, target: '$2' },
	    // (*01/01/1999*)
	    { source: /\(.*[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4}.*\)/i, target: '' },
	    // Sub Español
	    { source: /sub\s*español/i, target: '' },
	    // (Letra/Lyrics)
	    { source: /\s\(Letra\/Lyrics\)/i, target: '' },
	    // (Letra)
	    { source: /\s\(Letra\)/i, target: '' },
	    // (En vivo)
	    { source: /\s\(En\svivo\)/i, target: '' },
	    // Sub Español
	    { source: /sub\s*español/i, target: '' },
	];
	/**
	 * Special filter rules to remove leftoves after filtering text using
	 * `YOUTUBE_TRACK_FILTER_RULES` filter rules.
	 */
	const TRIM_SYMBOLS_FILTER_RULES = [
	    // Leftovers after e.g. (official video)
	    { source: /\(+\s*\)+/, target: '' },
	    // trim starting white chars and dash
	    { source: /^[/,:;~-\s"]+/, target: '' },
	    // trim trailing white chars and dash
	    { source: /[/,:;~-\s"]+$/, target: '' },
	    // remove multiple spaces
	    { source: /\s{1,}/, target: ' ' },
	];
	/**
	 * Filter rules to remove "Remastered..."-like strings from a text.
	 */
	const REMASTERED_FILTER_RULES = [
	    // Here Comes The Sun - Remastered
	    { source: /-\sRemastered$/, target: '' },
	    // Hey Jude - Remastered 2015
	    { source: /-\sRemastered\s\d+$/, target: '' },
	    // Let It Be (Remastered 2009)
	    // Red Rain (Remaster 2012)
	    { source: /\(Remaster(ed)?\s\d+\)$/, target: '' },
	    // Pigs On The Wing (Part One) [2011 - Remaster]
	    { source: /\[\d+\s-\sRemaster\]$/, target: '' },
	    // Comfortably Numb (2011 - Remaster)
	    // Dancing Days (2012 Remaster)
	    { source: /\(\d+(\s-)?\sRemaster\)$/, target: '' },
	    // Outside The Wall - 2011 - Remaster
	    // China Grove - 2006 Remaster
	    { source: /-\s\d+(\s-)?\sRemaster$/, target: '' },
	    // Learning To Fly - 2001 Digital Remaster
	    { source: /-\s\d+\s.+?\sRemaster$/, target: '' },
	    // Your Possible Pasts - 2011 Remastered Version
	    { source: /-\s\d+\sRemastered Version$/, target: '' },
	    // Roll Over Beethoven (Live / Remastered)
	    { source: /\(Live\s\/\sRemastered\)$/i, target: '' },
	    // Ticket To Ride - Live / Remastered
	    { source: /-\sLive\s\/\sRemastered$/, target: '' },
	    // Mothership (Remastered)
	    // How The West Was Won [Remastered]
	    { source: /[([]Remastered[)\]]$/, target: '' },
	    // A Well Respected Man (2014 Remastered Version)
	    // A Well Respected Man [2014 Remastered Version]
	    { source: /[([]\d{4} Re[Mm]astered Version[)\]]$/, target: '' },
	    // She Was Hot (2009 Re-Mastered Digital Version)
	    // She Was Hot (2009 Remastered Digital Version)
	    { source: /[([]\d{4} Re-?[Mm]astered Digital Version[)\]]$/, target: '' },
	];
	const LIVE_FILTER_RULES = [
	    // Track - Live
	    { source: /-\sLive?$/, target: '' },
	    // Track - Live at
	    { source: /-\sLive\s.+?$/, target: '' },
	];
	const CLEAN_EXPLICIT_FILTER_RULES = [
	    // (Explicit) or [Explicit]
	    { source: /\s[([]Explicit[)\]]/i, target: '' },
	    // (Clean) or [Clean]
	    { source: /\s[([]Clean[)\]]/i, target: '' },
	];
	const FEATURE_FILTER_RULES = [
	    // [Feat. Artist] or (Feat. Artist)
	    { source: /\s[([]feat. .+[)\]]/i, target: '' },
	];
	const NORMALIZE_FEATURE_FILTER_RULES = [
	    // [Feat. Artist] or (Feat. Artist) -> Feat. Artist
	    { source: /\s[([](feat. .+)[)\]]/i, target: ' $1' },
	];
	/**
	 * Filter rules to remove "(Album|Stereo|Mono Version)"-like strings
	 * from a text.
	 */
	const VERSION_FILTER_RULES = [
	    // Love Will Come To You (Album Version)
	    { source: /[([]Album Version[)\]]$/, target: '' },
	    // I Melt With You (Rerecorded)
	    // When I Need You [Re-Recorded]
	    { source: /[([]Re-?recorded[)\]]$/, target: '' },
	    // Your Cheatin' Heart (Single Version)
	    { source: /[([]Single Version[)\]]$/, target: '' },
	    // All Over Now (Edit)
	    { source: /[([]Edit[)\]]$/, target: '' },
	    // (I Can't Get No) Satisfaction - Mono Version
	    { source: /-\sMono Version$/, target: '' },
	    // Ruby Tuesday - Stereo Version
	    { source: /-\sStereo Version$/, target: '' },
	    // Pure McCartney (Deluxe Edition)
	    { source: /\(Deluxe Edition\)$/, target: '' },
	    // 6 Foot 7 Foot (Explicit Version)
	    { source: /[([]Explicit Version[)\]]/i, target: '' },
	];
	const SUFFIX_FILTER_RULES = [
	    // "- X Remix" -> "(X Remix)" and similar
	    {
	        source: /-\s(.+?)\s((Re)?mix|edit|dub|mix|vip|version)$/i,
	        target: '($1 $2)',
	    },
	    { source: /-\s(Remix|VIP)$/i, target: '($1)' },
	    // Remove "- Original" suffix
	    { source: /-\sOriginal$/i, target: '' },
	];

	const escapeHtmlEntityMap = {
	    '&': /&amp;/g,
	    '<': /&lt;/g,
	    '>': /&gt;/g,
	    '"': /&quot;/g,
	};
	/**
	 * Generate Album Artist from Artist when "feat. Artist B" is present.
	 *
	 * @param text String to be filtered
	 *
	 * @return Transformed string
	 */
	function albumArtistFromArtist(text) {
	    if (text.includes(' feat. ')) {
	        return text.split(' feat. ')[0];
	    }
	    return text;
	}
	/**
	 * Decode HTML entities in given text string.
	 *
	 * @param text String with HTML entities
	 *
	 * @return Decoded string
	 */
	function decodeHtmlEntities(text) {
	    let filteredText = text;
	    for (const target in escapeHtmlEntityMap) {
	        const source = escapeHtmlEntityMap[target];
	        filteredText = filteredText.replace(source, target);
	    }
	    filteredText = filteredText.replace(/&#x([a-fA-f0-9]+);/g, (_, hex) => {
	        const dec = parseInt(hex, 16);
	        return String.fromCharCode(dec);
	    });
	    filteredText = filteredText.replace(/&#(\d+);/g, (_, dec) => {
	        return String.fromCharCode(dec);
	    });
	    return filteredText;
	}
	/**
	 * Replace text according to given filter rules.
	 *
	 * @param text String to be filtered
	 * @param filterRules Array of replace rules
	 *
	 * @return Filtered string
	 */
	function filterWithFilterRules(text, filterRules) {
	    return filterRules.reduce((text, filterRule) => {
	        const { source, target } = filterRule;
	        return text.replace(source, target);
	    }, text);
	}
	/**
	 * Replace "Title - X Remix" suffix with "Title (X Remix) and similar".
	 *
	 * @param text String to be filtered
	 *
	 * @return Filtered string
	 */
	function fixTrackSuffix(text) {
	    return filterWithFilterRules(text, SUFFIX_FILTER_RULES);
	}
	/**
	 * Generate normalized "feat. Artist B" text from [feat. Artist B] style.
	 *
	 * @param text String to be filtered
	 *
	 * @return Transformed string
	 */
	function normalizeFeature(text) {
	    return filterWithFilterRules(text, NORMALIZE_FEATURE_FILTER_RULES);
	}
	/**
	 * Remove zero-width characters from given string.
	 *
	 * @param text String to be filtered
	 *
	 * @return Filtered string
	 */
	function removeZeroWidth(text) {
	    return text.replace(/[\u200B-\u200D\uFEFF]/g, '');
	}
	/**
	 * Replace all non-breaking space symbols with a space symbol.
	 *
	 * @param text String to be filtered
	 *
	 * @return Filtered string
	 */
	function replaceNbsp(text) {
	    return text.replace(/\u00a0/g, '\u0020');
	}
	/**
	 * Remove "Explicit" and "Clean"-like strings from the text.
	 *
	 * @param text String to be filtered
	 *
	 * @return Filtered string
	 */
	function removeCleanExplicit(text) {
	    return filterWithFilterRules(text, CLEAN_EXPLICIT_FILTER_RULES);
	}
	/**
	 * Remove "Live..."-like strings from the text.
	 *
	 * @param text String to be filtered
	 *
	 * @return Filtered string
	 */
	function removeLive(text) {
	    return filterWithFilterRules(text, LIVE_FILTER_RULES);
	}
	/**
	 * Remove "Remastered..."-like strings from the text.
	 *
	 * @param text String to be filtered
	 *
	 * @return Filtered string
	 */
	function removeRemastered(text) {
	    return filterWithFilterRules(text, REMASTERED_FILTER_RULES);
	}
	/**
	 * Remove "(Single|Album|Mono version}"-like strings from the text.
	 *
	 * @param text String to be filtered
	 *
	 * @return Filtered string
	 */
	function removeVersion(text) {
	    return filterWithFilterRules(text, VERSION_FILTER_RULES);
	}
	/**
	 * Remove "feat"-like strings from the text.
	 *
	 * @param text String to be filtered
	 *
	 * @return Filtered string
	 */
	function removeFeature(text) {
	    return filterWithFilterRules(text, FEATURE_FILTER_RULES);
	}
	/**
	 * Remove Youtube-related garbage from the text.
	 *
	 * @param text String to be filtered
	 *
	 * @return Filtered string
	 */
	function youtube(text) {
	    return filterWithFilterRules(text, [
	        ...YOUTUBE_TRACK_FILTER_RULES,
	        ...TRIM_SYMBOLS_FILTER_RULES,
	    ]);
	}

	/**
	 * Get a filter with YouTube-related filter functions.
	 *
	 * @return Filter object
	 */
	function getYoutubeFilter() {
	    return new MetadataFilter({ track: youtube });
	}
	/**
	 * Get a filter that removes "Remastered"-like suffixes.
	 *
	 * @return Filter object
	 */
	function getRemasteredFilter() {
	    return new MetadataFilter({
	        track: removeRemastered,
	        album: removeRemastered,
	    });
	}
	/**
	 * Get a filter with Spotify-related filter functions.
	 *
	 * @return Filter object
	 */
	function getSpotifyFilter() {
	    return new MetadataFilter({
	        track: [removeRemastered, fixTrackSuffix, removeLive],
	        album: [removeRemastered, fixTrackSuffix, removeLive],
	    });
	}
	/**
	 * Get a filter with Amazon-related filter functions.
	 *
	 * @return Filter object
	 */
	function getAmazonFilter() {
	    return new MetadataFilter({
	        artist: [normalizeFeature],
	        track: [
	            removeCleanExplicit,
	            removeFeature,
	            removeRemastered,
	            fixTrackSuffix,
	            removeVersion,
	            removeLive,
	        ],
	        album: [
	            decodeHtmlEntities,
	            removeCleanExplicit,
	            removeRemastered,
	            fixTrackSuffix,
	            removeVersion,
	            removeLive,
	        ],
	        albumArtist: [normalizeFeature, albumArtistFromArtist],
	    });
	}
	/**
	 * Get a filter with Tidal-related filter functions.
	 *
	 * @return Filter object
	 */
	function getTidalFilter() {
	    return new MetadataFilter({
	        track: [removeRemastered, fixTrackSuffix, removeVersion, removeLive],
	        album: [removeRemastered, fixTrackSuffix, removeVersion, removeLive],
	    });
	}

	exports.MetadataFilter = MetadataFilter;
	exports.albumArtistFromArtist = albumArtistFromArtist;
	exports.createFilter = createFilter;
	exports.createFilterSetForFields = createFilterSetForFields;
	exports.decodeHtmlEntities = decodeHtmlEntities;
	exports.filterWithFilterRules = filterWithFilterRules;
	exports.fixTrackSuffix = fixTrackSuffix;
	exports.getAmazonFilter = getAmazonFilter;
	exports.getRemasteredFilter = getRemasteredFilter;
	exports.getSpotifyFilter = getSpotifyFilter;
	exports.getTidalFilter = getTidalFilter;
	exports.getYoutubeFilter = getYoutubeFilter;
	exports.normalizeFeature = normalizeFeature;
	exports.removeCleanExplicit = removeCleanExplicit;
	exports.removeFeature = removeFeature;
	exports.removeLive = removeLive;
	exports.removeRemastered = removeRemastered;
	exports.removeVersion = removeVersion;
	exports.removeZeroWidth = removeZeroWidth;
	exports.replaceNbsp = replaceNbsp;
	exports.youtube = youtube;

	Object.defineProperty(exports, '__esModule', { value: true });

})));

import type { Event, EventInstance, Jobs, Participant } from '@prisma/client';

export const rootFolder = new URL('../../../', import.meta.url);

/**
 * Left-to-right mark character.
 *
 * @see {@link https://en.wikipedia.org/wiki/Left-to-right_mark}
 */
export const leftToRightMark = String.fromCodePoint(8_206);

/**
 * Braille pattern blank character
 *
 * @see {@link https://en.wikipedia.org/wiki/Braille_Patterns}
 */
export const braillePatternBlank = String.fromCodePoint(10_240);

export enum BloombotEvents {
	CreateServerEvent = 'createServerEvent',
	PostEmbed = 'postEmbed',
	UpdateEmbed = 'updateEmbed',
	UpdateServerEvent = 'updateServerEvent'
}

export const enum BrandingColors {
	Primary = 0xbb77ea,
	ExpiredEvent = 0xff0000
}

export const enum ErrorIdentifiers {
	EventBannerImageDownloadError = 'EventBannerImageDownloadError',
	EventEditIdNotFound = 'EventEditIdNotFound',
	EventEditMessageChannelNotFoundError = 'EventEditMessageChannelNotFoundError',
	EventEditMessageFetchFailedError = 'EventEditMessageFetchFailedError',
	EventEditPostedMessageUndefinedError = 'EventEditPostedMessageUndefinedError',
	UnableToFindEventForButtonClickError = 'UnableToFindEventForButtonClickError',
	UnableToFindEventForSelectMenuChoiceError = 'unableToFindEventForSelectMenuChoiceError',
	UnexpectedRoleSelectMenuChoiceError = 'unexpectedRoleSelectMenuChoiceError'
}

/* eslint-disable typescript-sort-keys/string-enum */
export const enum CustomIdPrefixes {
	Job = 'job',
	RoleSelectMenu = 'role-select-menu',
	RoleBench = 'role-bench',
	RoleLate = 'role-late',
	RoleTentative = 'role-tentative',
	RoleAbsence = 'role-absence',
	RemoveParticipation = 'remove-participation',

	Bluemage = 'bluemage',

	Astrologian = 'astrologian',
	Sage = 'sage',
	Scholar = 'scholar',
	Whitemage = 'whitemage',

	Blackmage = 'blackmage',
	Pictomancer = 'pictomancer',
	Redmage = 'redmage',
	Summoner = 'summoner',

	Dragoon = 'dragoon',
	Monk = 'monk',
	Ninja = 'ninja',
	Reaper = 'reaper',
	Samurai = 'samurai',
	Viper = 'viper',

	Bard = 'bard',
	Dancer = 'dancer',
	Machinist = 'machinist',

	DarkKnight = 'darkknight',
	Gunbreaker = 'gunbreaker',
	Paladin = 'paladin',
	Warrior = 'warrior',

	PhantomJobSelectMenu = 'phantom-job-select-menu'
}
/* eslint-enable typescript-sort-keys/string-enum */

interface EventIdGuildIdPayload {
	eventId: string;
	guildId: string;
}

export interface CreateServerEventPayload extends EventIdGuildIdPayload {
	discordEventId: string | null;
	eventId: string;
	guildId: string;
	isReschedule: boolean;
}

export type UpdateServerEventPayload = EventIdGuildIdPayload;

export type PostEmbedPayload = EventIdGuildIdPayload;

export interface UpdateEmbedPayload extends EventIdGuildIdPayload {
	origin: UpdateEmbedPayloadOrigin;
	shouldDisableEvent?: boolean;
}

export const enum UpdateEmbedPayloadOrigin {
	DisableOldEventScheduledTask = 'disable-old-event-scheduled-task',
	EditEventCommand = 'edit-event-command',
	JobOrRoleButtonClick = 'job-or-role-button-click',
	RemoveParticipation = 'remove-participation',
	RoleSelectMenu = 'role-select-menu'
}

export type EventData = Pick<Event, 'bannerImage' | 'channelId' | 'description' | 'id' | 'leader' | 'name' | 'roleToPing' | 'variant'> & {
	instance: Pick<EventInstance, 'dateTime'> & {
		participants: Pick<Participant, 'discordId' | 'job' | 'role' | 'signupOrder'>[];
	};
};

type JobTypeEmojis = 'AllRounder' | 'DPS' | 'Healer' | 'MagicRangedDPS' | 'MeleeDPS' | 'PhantomJob' | 'PhysRangedDPS' | 'Tank';
type EventDataEmojis =
	| 'Absence'
	| 'Bench'
	| 'Countdown'
	| 'CountdownExpired'
	| 'Date'
	| 'DateExpired'
	| 'Late'
	| 'Leader'
	| 'RemoveParticipation'
	| 'Signups'
	| 'SignupsExpired'
	| 'Tentative'
	| 'Time'
	| 'TimeExpired';
type OtherEmojis = 'GreenTick' | 'Nightbloom' | 'RedCross';

export type Emojis = EventDataEmojis | Jobs | JobTypeEmojis | OtherEmojis;

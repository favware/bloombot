import { CustomIdPrefixes } from '#lib/util/constants';
import { ButtonBuilder, ButtonStyle } from 'discord.js';

export function getPresenceStateButtons(eventId: string) {
	const benchButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.RoleBench}|${eventId}`)
		.setEmoji({ id: '1324558621530521681', name: 'Bench' })
		.setLabel('Bench')
		.setStyle(ButtonStyle.Secondary);
	const lateButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.RoleLate}|${eventId}`)
		.setEmoji({ id: '1324558634243457117', name: 'Late' })
		.setLabel('Late')
		.setStyle(ButtonStyle.Secondary);
	const tentativeButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.RoleTentative}|${eventId}`)
		.setEmoji({ id: '1324558656326467616', name: 'Tentative' })
		.setLabel('Tentative')
		.setStyle(ButtonStyle.Secondary);
	const absenceButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.RoleAbsence}|${eventId}`)
		.setEmoji({ id: '1324558615939649559', name: 'Absence' })
		.setLabel('Absence')
		.setStyle(ButtonStyle.Secondary);
	const removeParticipationButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.RemoveParticipation}|${eventId}`)
		.setEmoji({ id: '1325255133592031272', name: 'RemoveParticipation' })
		.setLabel('Remove Participation')
		.setStyle(ButtonStyle.Secondary);

	return [benchButton, lateButton, tentativeButton, absenceButton, removeParticipationButton];
}

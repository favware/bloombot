import { CustomIdPrefixes } from '#lib/util/constants';
import { formatPhantomJobName } from '#lib/util/functions/formatPhantomJobName';
import { getPresenceStateButtons } from '#lib/util/functions/getPresenceStateButtons';
import { $Enums } from '@prisma/client';
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, type ButtonBuilder } from 'discord.js';

const PhantomBardOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomBard))
	.setValue($Enums.Jobs.PhantomBard)
	.setEmoji({ id: '1375034095393832991', name: 'PhantomBard' })
	.setDescription('Select this option if you are a Phantom Bard');
const PhantomBerserkerOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomBerserker))
	.setValue($Enums.Jobs.PhantomBerserker)
	.setEmoji({ id: '1375034090343895051', name: 'PhantomBerserker' })
	.setDescription('Select this option if you are a Phantom Berserker');
const PhantomCannoneerOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomCannoneer))
	.setValue($Enums.Jobs.PhantomCannoneer)
	.setEmoji({ id: '1375034085679829043', name: 'PhantomCannoneer' })
	.setDescription('Select this option if you are a Phantom Cannoneer');
const PhantomChemistOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomChemist))
	.setValue($Enums.Jobs.PhantomChemist)
	.setEmoji({ id: '1375034096794996737', name: 'PhantomChemist' })
	.setDescription('Select this option if you are a Phantom Chemist');
const PhantomFreelancerOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomFreelancer))
	.setValue($Enums.Jobs.PhantomFreelancer)
	.setEmoji({ id: '1375034084694294549', name: 'PhantomFreelancer' })
	.setDescription('Select this option if you are a Phantom Freelancer');
const PhantomGeomancerOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomGeomancer))
	.setValue($Enums.Jobs.PhantomGeomancer)
	.setEmoji({ id: '1375034083427483710', name: 'PhantomGeomancer' })
	.setDescription('Select this option if you are a Phantom Geomancer');
const PhantomKnightOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomKnight))
	.setValue($Enums.Jobs.PhantomKnight)
	.setEmoji({ id: '1375034086464290920', name: 'PhantomKnight' })
	.setDescription('Select this option if you are a Phantom Knight');
const PhantomMonkOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomMonk))
	.setValue($Enums.Jobs.PhantomMonk)
	.setEmoji({ id: '1375034092160286801', name: 'PhantomMonk' })
	.setDescription('Select this option if you are a Phantom Monk');
const PhantomOracleOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomOracle))
	.setValue($Enums.Jobs.PhantomOracle)
	.setEmoji({ id: '1375034087785500683', name: 'PhantomOracle' })
	.setDescription('Select this option if you are a Phantom Oracle');
const PhantomRangerOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomRanger))
	.setValue($Enums.Jobs.PhantomRanger)
	.setEmoji({ id: '1375034089186525247', name: 'PhantomRanger' })
	.setDescription('Select this option if you are a Phantom Ranger');
const PhantomSamuraiOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomSamurai))
	.setValue($Enums.Jobs.PhantomSamurai)
	.setEmoji({ id: '1375034082249019492', name: 'PhantomSamurai' })
	.setDescription('Select this option if you are a Phantom Samurai');
const PhantomThiefOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomThief))
	.setValue($Enums.Jobs.PhantomThief)
	.setEmoji({ id: '1375034080416104519', name: 'PhantomThief' })
	.setDescription('Select this option if you are a Phantom Thief');
const PhantomTimeMageOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomTimeMage))
	.setValue($Enums.Jobs.PhantomTimeMage)
	.setEmoji({ id: '1375034093753864262', name: 'PhantomTimeMage' })
	.setDescription('Select this option if you are a Phantom Time Mage');

export function buildPhantomJobComponent(eventId: string, shouldDisableEvent = false) {
	const phantomJobSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(`${CustomIdPrefixes.PhantomJobSelectMenu}|${eventId}`)
		.setOptions(
			PhantomBardOption,
			PhantomBerserkerOption,
			PhantomCannoneerOption,
			PhantomChemistOption,
			PhantomFreelancerOption,
			PhantomGeomancerOption,
			PhantomKnightOption,
			PhantomMonkOption,
			PhantomOracleOption,
			PhantomRangerOption,
			PhantomSamuraiOption,
			PhantomThiefOption,
			PhantomTimeMageOption
		);

	const firstRow = new ActionRowBuilder<StringSelectMenuBuilder>();

	if (shouldDisableEvent) {
		phantomJobSelectMenu.setDisabled(true).setPlaceholder('This event is closed');
		firstRow.setComponents(phantomJobSelectMenu);
		return [firstRow];
	}

	firstRow.setComponents(phantomJobSelectMenu);
	const secondRow = new ActionRowBuilder<ButtonBuilder>().setComponents(getPresenceStateButtons(eventId));

	return [firstRow, secondRow];
}

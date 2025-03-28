import { handleInteractionError } from '#utils/functions/interactionErrorHandler';
import { Listener, type Events, type InteractionHandlerError } from '@sapphire/framework';

export class UserListener extends Listener<typeof Events.InteractionHandlerError> {
	public run(error: Error, payload: InteractionHandlerError) {
		return handleInteractionError(error, payload);
	}
}

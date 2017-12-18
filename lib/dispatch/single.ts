
import { EventDispatch } from ".";

let dispatch: EventDispatch = null;

export async function getDispatcher(): Promise<EventDispatch> {
	if (!dispatch) {
		dispatch = new EventDispatch();
		await dispatch.setup();
	}
	return dispatch;
}

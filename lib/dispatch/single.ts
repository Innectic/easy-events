
import { EventDispatch } from ".";

let dispatch: EventDispatch = null;

export async function getDispatcher(...handlers: any[]): Promise<EventDispatch> {
	if (!dispatch) {
		dispatch = new EventDispatch();
		await dispatch.setup([]);
	}
	return dispatch;
}

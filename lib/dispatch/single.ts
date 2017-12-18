
import { EventDispatch } from ".";

let dispatch: EventDispatch = null;

export function getDispatcher(): EventDispatch {
	if (!dispatch) {
		dispatch = new EventDispatch();
	}
	return dispatch;
}

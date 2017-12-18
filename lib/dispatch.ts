
import { HANDLERS } from "./registry";
import { HANDLED_EVENT_METADATA_KEY } from "./annotation";

interface RegisteredHandlers {
	[event: string]: {
		handler: Function,
		owner: Function
	}[];
}

export class EventDispatch {
	private registered: RegisteredHandlers = {};

	public async setup(handlers: any[] = HANDLERS) {
		for (let handler of handlers) {
			if (!Reflect.hasMetadata(HANDLED_EVENT_METADATA_KEY, handler)) {
				console.error("Cannot register a handler that has no metadata.");
				continue;
			}
			// Valid handler, so lets handle the handler! :tm:
			const events = Reflect.getOwnMetadata(HANDLED_EVENT_METADATA_KEY, handler);
			for (let event of events) {
				const current = this.registered[event.name] || [];
				current.push({ handler: event.handler, owner: event.owner });
				this.registered[event.name] = current;
			}
		}
	}

	public async emit(event: string, data: any) {
		const handlers = this.registered[event];
		if (!handlers) {
			return;
		}
		handlers.forEach(async executor => {
			executor.owner.prototype[executor.handler.name](data);
		});
	}
}

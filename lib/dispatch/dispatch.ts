
import { HANDLERS } from "../registry";
import { HANDLED_EVENT_METADATA_KEY } from "../annotation";

interface RegisteredHandlers {
	[event: string]: {
		handler: Function;
		owner: Function;
		priority: number;
	}[];
}

export class EventDispatch {
	private registered: RegisteredHandlers = {};
	private isSetup = false;

	public async setup(handlers: any[]) {
		if (this.isSetup) {
			console.error("[Dispatcher] Cannot setup a setup dispatcher.");
			return;
		}
		for (let handler of handlers) {
			if (!Reflect.hasMetadata(HANDLED_EVENT_METADATA_KEY, handler)) {
				console.error("[Dispatcher] Cannot register a handler that has no metadata.");
				continue;
			}
			// Valid handler, so lets handle the handler! :tm:
			const events = Reflect.getOwnMetadata(HANDLED_EVENT_METADATA_KEY, handler);
			for (let event of events) {
				const current = this.registered[event.name] || [];
				current.push({
					handler: event.handler,
					owner: event.owner,
					priority: event.priority
				});
				this.registered[event.name] = current;
			}
		}
		this.isSetup = true;
	}

	public async emit(event: string, data: any) {
		if (!this.isSetup) {
			console.error("[Dispatcher] Cannot emit without setting up.");
			return;
		}
		const handlers = this.registered[event] || [];
		// Sort the handlers by priority
		const sorted = handlers.sort((a, b) => a.priority < b.priority ? 0 : 1);
		sorted.forEach(async executor => {
			executor.owner.prototype[executor.handler.name](data);
		});
	}
}

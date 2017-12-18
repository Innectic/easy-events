
# Easy Events

Creating evented systems shouldn't be hard, and it shouldn't involve EventEmitter (it kind of sucks!).

# Usage

```typescript

import { getDispatch, Event, EventController } from "easy-events";

@EventController()
class EventTest {

	@Event("cool_event")
	public async eventTest(data: string) {
		console.log(`Got a really cool event! ${data}`);
	}

	@Event("cool_event")
	@Priority(EventPriority.FIRST)
	public async anotherTest(data: string) {
		console.log(`I'm first! ${data}`);
	}
}

export class Core {

	public async start() {
		const dispatch = await getDispatch();
		await dispatch.emit("cool_event", "Woah, my event is so cool!");
	}
}
```

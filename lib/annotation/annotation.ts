
import { reflectAnnotations, createAnnotationFactory, setAnnotations } from "reflect-annotations";

import { HANDLERS } from "../registry";

import { EventPriority } from ".";

export const HANDLED_EVENT_METADATA_KEY = "handler:event:handled";
export const EVENT_PRIORITY_METADATA_KEY = "handler:event:priority";
export let injectableHandlers: any[] = [];

class PriorityAnnotation {
	constructor (public priority: number) {}
}
export const Priority = createAnnotationFactory(PriorityAnnotation);

class EventAnnotation {
	constructor(public eventName: string[] | string) {}
}
export const Event = createAnnotationFactory(EventAnnotation);

function attemptGetAnnotatedFunction(target: Function, component: any, skip: boolean): Function | null {
	const handler = target.prototype[component.name];
	if (!handler) {
		console.error(`[Annotation Processor] Unable to get the name of the function that was already annotated?!?!?!?! ${component.name}`);
		return null;
	}
	// Make sure this handler function doesn't have multiple annotations.
	if (Reflect.hasOwnMetadata(HANDLED_EVENT_METADATA_KEY, handler) && !skip) {
		console.error(`[Annotation Processor] Cannot redefine the handled event for handler function '${component.name}'.`);
		return null;
	}
	return handler;
}

export function EventController(injects?: boolean) {
	return (target: Function) => {
		let events: HandledEvent[] = [];

		const presentAnnotatedClassComponents = reflectAnnotations(target);
		for (let component of presentAnnotatedClassComponents) {
			for (let decorator of component.methodAnnotations) {
				// If it's not an event annotation, then we don't really care about it.
				if (decorator instanceof EventAnnotation) {
					// Since this is an event annotation, then we can actually deal with it.
					// First, make sure we have the handler's name.
					if (!decorator.eventName) {
						console.error(`[Annotation Processor] Cannot register a handler without a name! Error on: '${component.name}`);
						continue;
					}
					// We have the name, so figure out how many names we have.
					const names = typeof decorator.eventName === "string" ? [decorator.eventName] : decorator.eventName;
					for (let name of names) {
						// We now know what event(s) this function is handling.
						const handler = attemptGetAnnotatedFunction(target, component, false);
						if (!handler) {
							return;
						}
						// Since it doesn't we define the event, and the metadata.
						events.push({
							handler,
							name,
							owner: target
						});

						if (injects) {
							const currentAnnotations = component.classAnnotations;
							// @Revisit @Speed This is probably terribly slow.
							// @Revisit @Speed This is probably terribly slow.
							// @Revisit @Speed This is probably terribly slow.
							// @Revisit @Speed This is probably terribly slow.

							// Lazy load angular
							const angular = require("@angular/core");
							currentAnnotations.push(angular.Injectable);
							setAnnotations(target, null, currentAnnotations);
							injectableHandlers.push(target);
							Reflect.defineMetadata("handler:injected", true, target);
						}

						Reflect.defineMetadata(HANDLED_EVENT_METADATA_KEY, events, target);
					}
				} else if (decorator instanceof PriorityAnnotation) {
					// If it's the priority, then we just need to set the meta on the handler.
					if (decorator.priority === null || decorator.priority === undefined) {
						console.error("[Annotation Processor] Cannot set a undefined priority.")
						continue;
					}
					// Get the handler this is referring to.
					const handler = attemptGetAnnotatedFunction(target, component, true);
					// Set the meta on the handler
					if (!handler) {
						return;
					}
					Reflect.defineMetadata(EVENT_PRIORITY_METADATA_KEY, decorator.priority, target);
				}
			}
			HANDLERS.push(target);
		}
	}
}

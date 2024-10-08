import { DOM_TYPES, VDOM_TYPE } from "./h";
import { setAttributes } from "./attributes";
import { addEventListeners } from "./events";
import { extractPropsAndEvents } from "./utils/props";

export function mountDOM(
	vdom: VDOM_TYPE,
	parentEl: any,
	index: number | null = null,
	hostComponent: any = null
) {
	switch (vdom.type) {
		case DOM_TYPES.TEXT:
			createTextNode(vdom, parentEl, index);
			break;

		case DOM_TYPES.ELEMENT:
			createElementNode(vdom, parentEl, index, hostComponent);
			break;

		case DOM_TYPES.FRAGMENT:
			createFragmentNode(vdom, parentEl, index, hostComponent);
			break;
		case DOM_TYPES.COMPONENT:
			createComponentNode(vdom, parentEl, index);
			break;
		default:
			throw new Error(`Can't mount DOM of type: ${vdom.type}`);
	}
}

function createTextNode(vdom: VDOM_TYPE, parentEl: any, index: number | null) {
	const { value } = vdom;
	const TextNode = document.createTextNode(value as string);
	vdom.el = TextNode;
	insert(index, TextNode, parentEl);
}

function createElementNode(
	vdom: VDOM_TYPE,
	parentEl: any,
	index: number | null,
	hostComponent: any = null
) {
	const { tag, props, children } = vdom;
	const element = document.createElement(tag as string);

	addProps(element, props, vdom, hostComponent);
	vdom.el = element;

	children?.forEach((child) => mountDOM(child, element, null, hostComponent));
	insert(index, element, parentEl);
}

function createFragmentNode(
	vdom: VDOM_TYPE,
	parentEl: any,
	index: number | null,
	hostComponent: any = null
) {
	vdom.el = parentEl;
	vdom.children?.forEach((child, i) =>
		mountDOM(child, parentEl, index ? index + i : null, hostComponent)
	);
}

function addProps(
	el: any,
	props: any,
	vdom: VDOM_TYPE,
	hostComponent: any = null
) {
	const { on: events, ...attrs } = props;
	vdom.listeners = addEventListeners(events, el, hostComponent);
	setAttributes(el, attrs);
}

function insert(index: number | null, el: any, parentEl: any): void {
	if (index == null) return parentEl.append(el);
	if (index < 0)
		throw new Error(`Index must be a positive integer, got ${index}`);
	if (index >= parentEl.childNodes.length) return parentEl.append(el);
	const node = parentEl.childNodes[index];
	parentEl.insertBefore(el, node);
}
function createComponentNode(
	vdom: VDOM_TYPE,
	parentEl: any,
	index: number | null,
	hostComponent: any = null
) {
	const Component = vdom.tag;
	const { props, events } = extractPropsAndEvents(vdom);
	const instance = new Component(props, events, hostComponent);

	instance.mount(parentEl, index);
	vdom.component = instance;
	vdom.el = instance.firstElement;
}

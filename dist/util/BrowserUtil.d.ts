import { Attribute } from "../CommonTypes";
export declare type ElementOffset = {
    left: number;
    top: number;
};
/**
 * Returns an element's position relative to the whole document (page).
 *
 * If the element does not exist, returns O/O (top-left window corner).
 *
 * @example getOffset(document.getElementById('#element'));
 *
 * @param el
 * @see https://stackoverflow.com/a/28222246/2391795
 */
export declare const getElementOffset: (el: Element | null) => ElementOffset;
export declare class BrowserUtil {
    constructor();
    scrollSmoothToId(elementId: string): void;
    scrollToBottomNow(element: HTMLElement): void;
    scrollToBottomSmooth(element: HTMLElement): void;
    scrollToElementInContainer(container: HTMLElement, element: HTMLElement): void;
    scrollSmoothTo(element: HTMLElement): void;
    scrollTo(element: HTMLElement): void;
    removeAllChildren(element: HTMLElement): void;
    addRemoveClasses(element: HTMLElement, classesText?: string | undefined, isAdding?: boolean): void;
    removeClasses(element: HTMLElement, classesText?: string | undefined): void;
    addClasses(element: HTMLElement, classesText?: string | undefined): void;
    addAttributes(element: HTMLElement, attributes: Attribute[] | undefined): void;
    addAttribute(element: HTMLElement, attribute: Attribute | undefined): void;
    removeAttributes(element: HTMLElement, attributes: string[]): void;
    allElementsFromPoint(x: number, y: number): Element[];
    isMobileDevice(): boolean;
}
declare const browserUtil: BrowserUtil;
export default browserUtil;

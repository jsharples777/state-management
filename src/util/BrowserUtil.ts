import {Attribute} from "../CommonTypes";

export type ElementOffset = {
    left: number;
    top: number
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
export const getElementOffset = (el: Element | null): ElementOffset => {
    const rect = el?.getBoundingClientRect();

    return {
        left: (rect?.left || 0) + window?.scrollX,
        top: (rect?.top || 0) + window?.scrollY,
    };
};


export class BrowserUtil {
    constructor() {
    }

    scrollSmoothToId(elementId: string): void {
        const element: HTMLElement | null = document.getElementById(elementId);
        if (element !== null) {
            element.scrollIntoView({
                block: 'start',
                behavior: 'smooth',
            });
        }
    }

    scrollToBottomNow(element: HTMLElement): void {
        if (element) {
            element.scrollTop = element.scrollHeight - element.clientHeight + 100;
        }
    }

    scrollToBottomSmooth(element: HTMLElement): void {
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
            });
            element.scrollTop = element.scrollHeight - element.clientHeight + 100;
        }
    }

    scrollToElementInContainer(container: HTMLElement, element: HTMLElement) {
        container.scrollIntoView({
            behavior: 'smooth',
        });
        container.scrollTop = element.offsetTop;
    }

    scrollSmoothTo(element: HTMLElement): void {
        element.scrollIntoView({
            block: 'start',
            behavior: 'smooth',
            inline: 'nearest'
        });
    }

    /*
    document.getElementById("yourDivID").scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"})
     */

    scrollTo(element: HTMLElement): void {
        element.scrollIntoView({
            block: 'start',
        });
    }

    removeAllChildren(element: HTMLElement): void {
        if (element && element.firstChild) {
            while (element.firstChild) {
                const lastChild: ChildNode | null = element.lastChild;
                if (lastChild) element.removeChild(lastChild);
            }
        }
    }

    addRemoveClasses(element: HTMLElement, classesText: string | undefined = undefined, isAdding: boolean = true): void {
        if (classesText) {
            const classes = classesText.split(' ');
            classes.forEach((classValue) => {
                if (classValue.trim().length > 0) {
                    if (isAdding) {
                        element.classList.add(classValue);
                    } else {
                        element.classList.remove(classValue);
                    }
                }
            });
        }
    }

    removeClasses(element: HTMLElement, classesText: string | undefined = undefined) {
        this.addRemoveClasses(element, classesText, false);
    }

    addClasses(element: HTMLElement, classesText: string | undefined = undefined) {
        this.addRemoveClasses(element, classesText, true);
    }

    addAttributes(element: HTMLElement, attributes: Attribute[] | undefined) {
        if (attributes) {
            attributes.forEach((attribute: any) => {
                element.setAttribute(attribute.name, attribute.value);
            });
        }
    }

    addAttribute(element: HTMLElement, attribute: Attribute | undefined) {
        if (attribute) {
            this.addAttributes(element, [attribute]);
        }


    }

    removeAttributes(element: HTMLElement, attributes: string[]) {
        attributes.forEach((attribute: string) => {
            element.removeAttribute(attribute);
        });
    }

    allElementsFromPoint(x: number, y: number) {
        var element, elements = [];
        var old_visibility = [];
        while (true) {
            element = document.elementFromPoint(x, y);
            if (!element || element === document.documentElement) {
                break;
            }
            elements.push(element);
            // @ts-ignore
            old_visibility.push(element.style.visibility);
            // @ts-ignore
            element.style.visibility = 'hidden'; // Temporarily hide the element (without changing the layout)
        }
        for (var k = 0; k < elements.length; k++) {
            // @ts-ignore
            elements[k].style.visibility = old_visibility[k];
        }
        elements.reverse();
        return elements;
    }

    public isMobileDevice(): boolean {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints >1)) {
            return true
        } else {
            return false
        }
    }

}

export const browserUtil = new BrowserUtil();

export default browserUtil;

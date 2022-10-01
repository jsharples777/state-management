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
export const getElementOffset = (el) => {
    const rect = el === null || el === void 0 ? void 0 : el.getBoundingClientRect();
    return {
        left: ((rect === null || rect === void 0 ? void 0 : rect.left) || 0) + (window === null || window === void 0 ? void 0 : window.scrollX),
        top: ((rect === null || rect === void 0 ? void 0 : rect.top) || 0) + (window === null || window === void 0 ? void 0 : window.scrollY),
    };
};
export class BrowserUtil {
    constructor() {
    }
    scrollSmoothToId(elementId) {
        const element = document.getElementById(elementId);
        if (element !== null) {
            element.scrollIntoView({
                block: 'start',
                behavior: 'smooth',
            });
        }
    }
    scrollToBottomNow(element) {
        if (element) {
            element.scrollTop = element.scrollHeight - element.clientHeight + 100;
        }
    }
    scrollToBottomSmooth(element) {
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
            });
            element.scrollTop = element.scrollHeight - element.clientHeight + 100;
        }
    }
    scrollToElementInContainer(container, element) {
        container.scrollIntoView({
            behavior: 'smooth',
        });
        container.scrollTop = element.offsetTop;
    }
    scrollSmoothTo(element) {
        element.scrollIntoView({
            block: 'start',
            behavior: 'smooth',
            inline: 'nearest'
        });
    }
    /*
    document.getElementById("yourDivID").scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"})
     */
    scrollTo(element) {
        element.scrollIntoView({
            block: 'start',
        });
    }
    removeAllChildren(element) {
        if (element && element.firstChild) {
            while (element.firstChild) {
                const lastChild = element.lastChild;
                if (lastChild)
                    element.removeChild(lastChild);
            }
        }
    }
    addRemoveClasses(element, classesText = undefined, isAdding = true) {
        if (classesText) {
            const classes = classesText.split(' ');
            classes.forEach((classValue) => {
                if (classValue.trim().length > 0) {
                    if (isAdding) {
                        element.classList.add(classValue);
                    }
                    else {
                        element.classList.remove(classValue);
                    }
                }
            });
        }
    }
    removeClasses(element, classesText = undefined) {
        this.addRemoveClasses(element, classesText, false);
    }
    addClasses(element, classesText = undefined) {
        this.addRemoveClasses(element, classesText, true);
    }
    addAttributes(element, attributes) {
        if (attributes) {
            attributes.forEach((attribute) => {
                element.setAttribute(attribute.name, attribute.value);
            });
        }
    }
    addAttribute(element, attribute) {
        if (attribute) {
            this.addAttributes(element, [attribute]);
        }
    }
    removeAttributes(element, attributes) {
        attributes.forEach((attribute) => {
            element.removeAttribute(attribute);
        });
    }
    allElementsFromPoint(x, y) {
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
    isMobileDevice() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
            return true;
        }
        else {
            return false;
        }
    }
}
export const browserUtil = new BrowserUtil();
export default browserUtil;
//# sourceMappingURL=BrowserUtil.js.map
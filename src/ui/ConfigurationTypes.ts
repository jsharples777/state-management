import {
    BasicButtonElement,
    BasicElement,
    DisplayOrder,
    Draggable,
    Droppable,
    ElementLocation,
    ExtraAction,
    FieldRuntimeConfig,
    FieldRuntimeGroup,
    IconClasses,
    ModifierClasses,
    UndefinedBoolean
} from "../CommonTypes";


export type ContentDetail = {
    containerClasses: string,
    textElement: BasicElement,
    select: boolean,
    quickDelete?: boolean,
    //icons?: getIcons,
    badge?: BasicElement,
    secondBadge?: BasicElement,
    thirdBadge?: BasicElement,
    delete?: BasicButtonElement,
    drag?: Draggable,
    background?: BasicElement,
}

export const EXTRA_ACTION_ATTRIBUTE_NAME: string = 'view-extra-action';


export type DetailViewRuntimeConfig = {
    fieldDisplayOrders: DisplayOrder[],
    fieldGroups?: FieldRuntimeGroup[],
    fieldRuntimeConfigs?: FieldRuntimeConfig[],
    deleteButton?: BasicButtonElement,
    saveButton: BasicButtonElement,
    cancelButton: BasicButtonElement,
    buttonLocation: ElementLocation,
    hideModifierFields?: UndefinedBoolean,
    hasExternalControl?: UndefinedBoolean,
    autoscrollOnNewContent?: UndefinedBoolean,
    autoSave?: UndefinedBoolean
}

export type TableViewRuntimeConfig = {
    fieldDisplayOrders: DisplayOrder[],
    fieldRuntimeConfigs?: FieldRuntimeConfig[],
    itemDetailColumn: number,
    itemDetailLabel?: string,
    hasActions?: UndefinedBoolean,
    hideModifierFields?: UndefinedBoolean,
    editableFields: string[],
    lazyLoadPageSize?: number,
    sortableTableHeaders?: string[]
}

export type ListViewRuntimeConfig = {
    lazyLoadPageSize: number
}

export enum ActionType {
    DELETE = 'delete',
    EXTRA_ACTION = 'extraAction',
    CUSTOM_TYPE1 = 'custom Type 1',
    CUSTOM_TYPE2 = 'custom Type 2',
    CUSTOM_TYPE3 = 'custom Type 3',
    CUSTOM_TYPE4 = 'custom Type 4',
    CUSTOM_TYPE5 = 'custom Type 5',
    CUSTOM_TYPE6 = 'custom Type 6',
    CUSTOM_TYPE7 = 'custom Type 7',
}


export enum Modifier {
    normal,
    active,
    inactive,
    warning
}

export enum KeyType {
    number,
    string,
    boolean,
    collection
}

export type ViewDOMConfig = {
    resultsContainerId: string,
    dataSourceId: string,
    drop?: Droppable
}


export type CollectionViewDOMConfig = {
    viewConfig: ViewDOMConfig,
    resultsElement: BasicElement,
    keyId: string,
    keyType: KeyType,
    modifiers?: ModifierClasses,
    icons?: IconClasses,
    detail: ContentDetail,
    extraActions?: ExtraAction[],
}


export enum SidebarLocation {
    top,
    right,
    left,
    bottom
}

export type SidebarPrefs = {
    id: string,
    location: SidebarLocation,
    expandedSize: string
}

export type SidebarViewConfig = {
    containerId: string
}

export type ViewPrefs = {
    sidebar?: SidebarPrefs
}

export enum RowPosition {
    first,
    last
}

export type CarouselDOMConfig = {
    itemsPerRow: {
        small: number,
        medium: number,
        large: number,
        xlarge: number,
    },
    rowContainer: BasicElement,
    activeRow: BasicElement,
    activeRowPosition: RowPosition,
    row: BasicElement,
    multipleItemsPerRowContainer?: BasicElement,
    actionContainer: BasicElement,
    collectionConfig: CollectionViewDOMConfig
}

export const SCREEN_WIDTH_LARGE = 992;
export const SCREEN_WIDTH_MEDIUM = 769;
export const SCREEN_WIDTH_SMALL = 415;

export type TabDOMConfig = {
    id: string,
    isDefaultActive?: boolean,
    element: BasicElement,
    subElement: BasicElement
}

export type TabularViewDOMConfig = {
    containerId: string, // what is our container id
    containedById: string, // who contains us
    titleBarContainer: BasicElement,
    itemDescriptionContainer: BasicElement,
    titleBarActionsContainer?: BasicElement,
    titleBarActions?: ExtraAction[],
    tabularViewContainer: BasicElement, // the container config
    tabs: TabDOMConfig[], // what tabs to we have
    tabBarContainer: BasicElement, // what contains the tab bar
    tabBarElement: BasicElement, // what is the top level container for the tab bar
    tabViewContainer: BasicElement, // the config for each tab view container
}


export enum CollectionViewSorterDirection {
    ascending = -1,
    descending = 1
}

export type CollectionViewSorter = {
    majorFieldId: string,
    majorDirection: CollectionViewSorterDirection,
    minorFieldId?: string
    minorDirection?: CollectionViewSorterDirection
}



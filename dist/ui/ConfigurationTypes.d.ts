import { BasicButtonElement, BasicElement, DisplayOrder, Draggable, Droppable, ElementLocation, ExtraAction, FieldRuntimeConfig, FieldRuntimeGroup, IconClasses, ModifierClasses, UndefinedBoolean } from "../CommonTypes";
export declare type ContentDetail = {
    containerClasses: string;
    textElement: BasicElement;
    select: boolean;
    quickDelete?: boolean;
    badge?: BasicElement;
    secondBadge?: BasicElement;
    thirdBadge?: BasicElement;
    delete?: BasicButtonElement;
    drag?: Draggable;
    background?: BasicElement;
};
export declare const EXTRA_ACTION_ATTRIBUTE_NAME: string;
export declare type DetailViewRuntimeConfig = {
    fieldDisplayOrders: DisplayOrder[];
    fieldGroups?: FieldRuntimeGroup[];
    fieldRuntimeConfigs?: FieldRuntimeConfig[];
    deleteButton?: BasicButtonElement;
    saveButton: BasicButtonElement;
    cancelButton: BasicButtonElement;
    buttonLocation: ElementLocation;
    hideModifierFields?: UndefinedBoolean;
    hasExternalControl?: UndefinedBoolean;
    autoscrollOnNewContent?: UndefinedBoolean;
    autoSave?: UndefinedBoolean;
};
export declare type TableViewRuntimeConfig = {
    fieldDisplayOrders: DisplayOrder[];
    fieldRuntimeConfigs?: FieldRuntimeConfig[];
    itemDetailColumn: number;
    itemDetailLabel?: string;
    hasActions?: UndefinedBoolean;
    hideModifierFields?: UndefinedBoolean;
    editableFields: string[];
    lazyLoadPageSize?: number;
    sortableTableHeaders?: string[];
};
export declare type ListViewRuntimeConfig = {
    lazyLoadPageSize: number;
};
export declare enum ActionType {
    DELETE = "delete",
    EXTRA_ACTION = "extraAction",
    CUSTOM_TYPE1 = "custom Type 1",
    CUSTOM_TYPE2 = "custom Type 2",
    CUSTOM_TYPE3 = "custom Type 3",
    CUSTOM_TYPE4 = "custom Type 4",
    CUSTOM_TYPE5 = "custom Type 5",
    CUSTOM_TYPE6 = "custom Type 6",
    CUSTOM_TYPE7 = "custom Type 7"
}
export declare enum Modifier {
    normal = 0,
    active = 1,
    inactive = 2,
    warning = 3
}
export declare enum KeyType {
    number = 0,
    string = 1,
    boolean = 2,
    collection = 3
}
export declare type ViewDOMConfig = {
    resultsContainerId: string;
    dataSourceId: string;
    drop?: Droppable;
};
export declare type CollectionViewDOMConfig = {
    viewConfig: ViewDOMConfig;
    resultsElement: BasicElement;
    keyId: string;
    keyType: KeyType;
    modifiers?: ModifierClasses;
    icons?: IconClasses;
    detail: ContentDetail;
    extraActions?: ExtraAction[];
};
export declare enum SidebarLocation {
    top = 0,
    right = 1,
    left = 2,
    bottom = 3
}
export declare type SidebarPrefs = {
    id: string;
    location: SidebarLocation;
    expandedSize: string;
};
export declare type SidebarViewConfig = {
    containerId: string;
};
export declare type ViewPrefs = {
    sidebar?: SidebarPrefs;
};
export declare enum RowPosition {
    first = 0,
    last = 1
}
export declare type CarouselDOMConfig = {
    itemsPerRow: {
        small: number;
        medium: number;
        large: number;
        xlarge: number;
    };
    rowContainer: BasicElement;
    activeRow: BasicElement;
    activeRowPosition: RowPosition;
    row: BasicElement;
    multipleItemsPerRowContainer?: BasicElement;
    actionContainer: BasicElement;
    collectionConfig: CollectionViewDOMConfig;
};
export declare const SCREEN_WIDTH_LARGE = 992;
export declare const SCREEN_WIDTH_MEDIUM = 769;
export declare const SCREEN_WIDTH_SMALL = 415;
export declare type TabDOMConfig = {
    id: string;
    isDefaultActive?: boolean;
    element: BasicElement;
    subElement: BasicElement;
};
export declare type TabularViewDOMConfig = {
    containerId: string;
    containedById: string;
    titleBarContainer: BasicElement;
    itemDescriptionContainer: BasicElement;
    titleBarActionsContainer?: BasicElement;
    titleBarActions?: ExtraAction[];
    tabularViewContainer: BasicElement;
    tabs: TabDOMConfig[];
    tabBarContainer: BasicElement;
    tabBarElement: BasicElement;
    tabViewContainer: BasicElement;
};
export declare enum CollectionViewSorterDirection {
    ascending = -1,
    descending = 1
}
export declare type CollectionViewSorter = {
    majorFieldId: string;
    majorDirection: CollectionViewSorterDirection;
    minorFieldId?: string;
    minorDirection?: CollectionViewSorterDirection;
};

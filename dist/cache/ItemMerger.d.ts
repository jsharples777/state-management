export interface ItemMerger {
    merge(stateName: string, sourceItem: any, cachedItem: any): any;
}

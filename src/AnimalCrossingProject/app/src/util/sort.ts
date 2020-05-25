import { OrderDocument } from "../models/Order";
export const priceTimeSort = function(asc: boolean) {
    let c = 1;
    if (asc === false) {
        c = -1;
    }

    return function(a: OrderDocument, b: OrderDocument) {
        if (a.price > b.price) return 1 * c;
        if (a.price < b.price) return -1 * c;
        if (a.createdTime > b.createdTime) return 1;
        if (a.createdTime < b.createdTime) return -1;
        return 0;
    };
};
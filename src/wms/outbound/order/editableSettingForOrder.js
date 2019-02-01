define([
], function () {
    var editableSetting = {
        "customer": {
            "isDisabled": true,
            "status": [
                "Loaded",
                "Partial Shipped",
                "Short Shipped",
                "Shipped",
                "Closed",
                "Reopen",
                "Cancelled"
            ]
        },
        "carrier": {
            "isDisabled": true,
            "status": [
                "Partial Shipped",
                "Short Shipped",
                "Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "deliveryService": {
            "isDisabled": true,
            "status": [
                "Partial Shipped",
                "Short Shipped",
                "Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "shipMethod": {
            "isDisabled": true,
            "status": [
                "Partial Shipped",
                "Short Shipped",
                "Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "freightTerm": {
            "isDisabled": true,
            "status": [
                "Partial Shipped",
                "Short Shipped",
                "Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "reference": {
            "isDisabled": true,
            "status": [
                "Closed",
                "Cancelled"
            ]
        },
        "po": {
            "isDisabled": true,
            "status": [
                "Closed",
                "Cancelled"
            ]
        },
        "so": {
            "isDisabled": true,
            "status": [
                "Partial Shipped",
                "Short Shipped",
                "Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "totalPallets": {
            "isDisabled": true,
            "status": [
                "Partial Shipped",
                "Short Shipped",
                "Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "madb": {
            "isDisabled": true,
            "status": [
                "Partial Shipped",
                "Short Shipped",
                "Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "scheduleDate": {
            "isDisabled": true,
            "status": [
                "Partial Shipped",
                "Short Shipped",
                "Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "placementTime": {
            "isDisabled": false,
            "status": []
        },
        "shippedTime": {
            "isDisabled": false,
            "status": [
                "Reopen"
            ]
        },
        "shipNotBefore": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "shipNotLater": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "status": {
            "isDisabled": false,
            "status": []
        },
        "allowPartialLockInventory": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Reopen",
                "Cancelled"
            ]
        },
        "commitmentIncludeWIP": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Reopen",
                "Cancelled"
            ]
        },
        "shippingAccountNo": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "shipFrom": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "shipTo": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "soldTo": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "store": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "billTo": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "pickNote": {
            "isDisabled": true,
            "status": [
                "Closed",
                "Cancelled"
            ]
        },
        "labelNote": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "packNote": {
            "isDisabled": true,
            "status": [
                "Closed",
                "Cancelled"
            ]
        },
        "orderNote": {
            "isDisabled": true,
            "status": [
                "Closed",
                "Cancelled"
            ]
        },
        "proNo": {
            "isDisabled": true,
            "status": [
                "Closed",
                "Cancelled"
            ]
        },
        "bolNote": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "priorityPoints": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Cancelled"
            ]
        },
        "retailer": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Cancelled"
            ]
        },

        "isTransload": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Reopen",
                "Cancelled"
            ]
        },
        "isRush": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Reopen",
                "Cancelled"
            ]
        },
        "enableAutoCommit": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Reopen",
                "Cancelled"
            ]
        },

        "isAllowRetryCommit": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Reopen",
                "Cancelled"
            ]
        },

        "allowUpdateOrderDetailWIP": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Reopen",
                "Cancelled"
            ]
        },
        "closeOrder": {
            "isDisabled": false,
            "status": [
                "Partial Shipped",
                // "Closed",
                "Reopen",
                "Cancelled",
                "Picked",
                "Packed",
                "Loaded"
            ]
        },
        "cancelOrder": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped",
                "Closed",
                "Reopen",
                "Cancelled"
            ]
        },
        "reopenOrder": {
            "isDisabled": false,
            "status": [
                "Shipped",
                "Short Shipped",
                "Partial Shipped"
            ]
        },
        "rollBackOrder": {
            "isDisabled": true,
            "status": [
                "Shipped",
                "Short Shipped",
                "Cancelled"
            ]
        },
        "seperateOrder": {
            "isDisabled": false,
            "status": [
                "Partial Committed"
            ]
        },
        "addItemLines": {
            "isDisabled": false,
            "status": [
                "Imported",
                "Open",
                "Committed",
                "Partial Committed",
                "Commit Blocked",
                "Commit Failed",
                "Pending",
                "On Hold"
            ]
        },
        "deleteItemLines": {
            "isDisabled": false,
            "status": [
                "Imported",
                "Open",
                "Committed",
                "Partial Committed",
                "Commit Blocked",
                "Commit Failed",
                "Pending",
                "On Hold"
            ]
        },
        "addMaterialLines": {
            "isDisabled": true,
            "status": [
                // "Imported",
                // "Open",
                // "Committed",
                // "Partial Committed",
                // "Commit Blocked",
                // "Commit Failed",
                // "Pending",
                // "On Hold"
            ]
        },
        "editMaterialLines": {
            "isDisabled": true,
            "status": [
                // "Imported",
                // "Open",
                // "Committed",
                // "Partial Committed",
                // "Commit Blocked",
                // "Commit Failed",
                // "Pending",
                // "On Hold"
            ]
        },
        "deleteMaterialLines": {
            "isDisabled": true,
            "status": [
                // "Imported",
                // "Open",
                // "Committed",
                // "Partial Committed",
                // "Commit Blocked",
                // "Commit Failed",
                // "Pending",
                // "On Hold"
            ]
        },
        "itemSpec": {
            "isDisabled": false,
            "isItemLineProperty": true,
            "status": [
                "Imported",
                "Open"
            ]
        },
        "title": {
            "isDisabled": false,
            "isItemLineProperty": true,
            "status": [
                "Imported",
                "Open",
                "Committed",
                "Partial Committed",
                "Commit Blocked",
                "Commit Failed",
                "Pending",
                "On Hold"
            ]
        },
        "supplier": {
            "isDisabled": false,
            "isItemLineProperty": true,
            "status": [
                "Imported",
                "Open",
                "Committed",
                "Partial Committed",
                "Commit Blocked",
                "Commit Failed",
                "Pending",
                "On Hold"
            ]
        },
        "unit": {
            "isDisabled": false,
            "isItemLineProperty": true,
            "status": [
                "Imported",
                "Open",
                "Committed",
                "Partial Committed",
                "Commit Blocked",
                "Commit Failed",
                "Pending",
                "On Hold"
            ]
        },
        "qty": {
            "isDisabled": false,
            "isItemLineProperty": true,
            "status": [
                "Imported",
                "Open",
                "Committed",
                "Partial Committed",
                "Commit Blocked",
                "Commit Failed",
                "Pending",
                "On Hold"
            ]
        },
        "palletQty": {
            "isDisabled": false,
            "isItemLineProperty": true,
            "status": [
                "Imported",
                "Open",
                "Committed",
                "Partial Committed",
                "Commit Blocked",
                "Commit Failed",
                "Pending",
                "On Hold"
            ]
        },
        "adjustedPalletQty": {
            "isDisabled": false,
            "isItemLineProperty": true,
            "status": [
                "Picked",
                "Short Shipped",
                "Shipped",
                "Reopen"
            ]
        },
        "receiptProperty": {
            "isDisabled": false,
            "isItemLineProperty": true,
            "status": [
                "Imported",
                "Open",
                "Committed",
                "Partial Committed",
                "Commit Blocked",
                "Commit Failed",
                "Pending",
                "On Hold"
            ]
        },
        "lpConfigurationId": {
            "isDisabled": false,
            "isItemLineProperty": true,
            "status": [
                "Imported",
                "Open",
                "Committed",
                "Partial Committed",
                "Commit Blocked",
                "Commit Failed",
                "Pending",
                "On Hold"
            ]
        },
        "lotNo": {
            "isDisabled": false,
            "isItemLineProperty": true,
            "status": [
                "Imported",
                "Open",
                "Committed",
                "Partial Committed",
                "Commit Blocked",
                "Commit Failed",
                "Pending",
                "On Hold"
            ]
        },
        "note": {
            "isDisabled": false,
            "isItemLineProperty": true,
            "status": [
                "Imported",
                "Open",
                "Committed",
                "Partial Committed",
                "Commit Blocked",
                "Commit Failed",
                "Pending",
                "On Hold",
                "Partial Shipped",
                "Short Shipped",
                "Shipped"
            ]
        }
    }
    return editableSetting;
});

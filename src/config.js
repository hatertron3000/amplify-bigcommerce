const config = {
    "modules": [
        {
            "name": "Store Information",
            "path": "/dashboard/store-information",
            "component": "StoreInformation",
            "version": "1.0"
        }
    ],
    "lang": {
        "Dashboard": {
            "Navigation": {
                "brand": "Amplify BigCommerce"
            },
            "StoreInformation": {
                "button": "Get Information",
                "cta": "Click the button to retrieve information about this store.",
                "error": "Error retrieving store information",
                "heading": "Get Store Information"
            },
        },
        "Install": {
            "error": "Error during installation.",
            "heading": "Amplify BigCommerce",
            "success": "Successfully installed. Please close and reopen the app to begin using it.",
            "tos_intro": "Check this box to agree to the terms of service. Consider adding a form here to gather additional information.",
            "view_tos": "Click here to view the terms of service"
        },
        "Load": {
            "error": "Error loading the app"
        }
    }
}

export default config
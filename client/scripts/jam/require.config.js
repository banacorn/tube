var jam = {
    "packages": [
        {
            "name": "backbone",
            "location": "jam/backbone",
            "main": "backbone.js"
        },
        {
            "name": "eve",
            "location": "jam/eve",
            "main": "eve.js"
        },
        {
            "name": "hogan",
            "location": "jam/hogan",
            "main": "hogan.js"
        },
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "raphael",
            "location": "jam/raphael",
            "main": "raphael.amd.js"
        },
        {
            "name": "underscore",
            "location": "jam/underscore",
            "main": "underscore.js"
        }
    ],
    "version": "0.2.17",
    "shim": {
        "backbone": {
            "deps": [
                "underscore",
                "jquery"
            ],
            "exports": "Backbone"
        },
        "hogan": {
            "exports": "hogan"
        },
        "underscore": {
            "exports": "_"
        }
    }
};

if (typeof require !== "undefined" && require.config) {
    require.config({
    "packages": [
        {
            "name": "backbone",
            "location": "jam/backbone",
            "main": "backbone.js"
        },
        {
            "name": "eve",
            "location": "jam/eve",
            "main": "eve.js"
        },
        {
            "name": "hogan",
            "location": "jam/hogan",
            "main": "hogan.js"
        },
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "raphael",
            "location": "jam/raphael",
            "main": "raphael.amd.js"
        },
        {
            "name": "underscore",
            "location": "jam/underscore",
            "main": "underscore.js"
        }
    ],
    "shim": {
        "backbone": {
            "deps": [
                "underscore",
                "jquery"
            ],
            "exports": "Backbone"
        },
        "hogan": {
            "exports": "hogan"
        },
        "underscore": {
            "exports": "_"
        }
    }
});
}
else {
    var require = {
    "packages": [
        {
            "name": "backbone",
            "location": "jam/backbone",
            "main": "backbone.js"
        },
        {
            "name": "eve",
            "location": "jam/eve",
            "main": "eve.js"
        },
        {
            "name": "hogan",
            "location": "jam/hogan",
            "main": "hogan.js"
        },
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "raphael",
            "location": "jam/raphael",
            "main": "raphael.amd.js"
        },
        {
            "name": "underscore",
            "location": "jam/underscore",
            "main": "underscore.js"
        }
    ],
    "shim": {
        "backbone": {
            "deps": [
                "underscore",
                "jquery"
            ],
            "exports": "Backbone"
        },
        "hogan": {
            "exports": "hogan"
        },
        "underscore": {
            "exports": "_"
        }
    }
};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}
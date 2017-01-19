module.exports = {
    "env": {
        "browser": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "warn",
            2,
            {
                "SwitchCase": 1
            }
        ],
        "linebreak-style": [
            "off",
            "unix"
        ],
        "quotes": [
            "warn",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
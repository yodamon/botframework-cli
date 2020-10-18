/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const LUResource = require('./../lufile/luResource')
const parser = require('./../lufile/luParser')

class Sections {
    /**
     * Builds a Luis instance from a Lu Content.
     * @param {string} luContent LU content
     * @returns {LUResource} LUResource
     * @throws {exception} Throws on errors. exception object includes errCode and text. 
     */
    static fromContentAsync(luContent) {
        return parser.parse(luContent)
    }
}

module.exports = Sections